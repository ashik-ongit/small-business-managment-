import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Business, Transaction } from './models.js';
import {validateRow, summarize, validDate} from './logic.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL || 'http://localhost:5173'}));
app.use(express.json({limit:'64kb'}));
app.use('/api',rateLimit({windowMs:15*60*1000,limit:900,standardHeaders:'draft-7',legacyHeaders:false}));
const secret = process.env.JWT_SECRET;
const issue = user => jwt.sign({sub:String(user._id)}, secret, {expiresIn:'2d'});
function publicUser(user, business) { return {id:String(user._id),name:user.name,email:user.email,role:user.role,businessId:String(user.businessId),businessName:business?.name}; }
const fail = (res, status, message) => res.status(status).json({message});
function sanitizeError(err,res) {
  if (err?.code === 11000) return fail(res,409,'This email is already registered.');
  if (err?.name === 'ValidationError' || err?.name === 'CastError') return fail(res,400,'Invalid input data.');
  console.error('API error:',err);return fail(res,500,'Server error. Check backend logs.');
}
async function auth(req,res,next) {
  try {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token) return fail(res,401,'Please log in.');
    const payload=jwt.verify(token,secret);
    const user=await User.findById(payload.sub);
    if (!user) return fail(res,401,'User no longer exists.');
    req.user=user;next();
  } catch { return fail(res,401,'Session expired or invalid. Log in again.'); }
}
app.get('/api/health',(_,res)=>res.json({ok:true,app:'Small Business Management System'}));
app.post('/api/auth/register',async(req,res)=>{
  try {
    const {name,email,password,businessName}=req.body||{};
    if (!name || name.length>80 || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length<8 || !businessName || businessName.length>100) return fail(res,400,'Enter your name, valid email, password (8+ characters) and business name.');
    if (await User.exists({email:email.trim().toLowerCase()})) return fail(res,409,'Email is already registered.');
    const business=await Business.create({name:businessName.trim(),ownerEmail:email.trim().toLowerCase()});
    try {
      const user=await User.create({name:name.trim(),email:email.trim().toLowerCase(),passwordHash:await bcrypt.hash(password,12),businessId:business._id});
      return res.status(201).json({token:issue(user),user:publicUser(user,business)});
    } catch(e) {await Business.findByIdAndDelete(business._id);throw e;}
  } catch(e) {sanitizeError(e,res);}
});
app.post('/api/auth/login',async(req,res)=>{
  try {
    const email=String(req.body?.email||'').trim().toLowerCase();
    const user=await User.findOne({email}).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(req.body?.password||''),user.passwordHash))) return fail(res,401,'Incorrect email or password.');
    const business=await Business.findById(user.businessId);
    res.json({token:issue(user),user:publicUser(user,business)});
  } catch(e) {sanitizeError(e,res);}
});
app.get('/api/auth/me',auth,async(req,res)=>{
  try {const b=await Business.findById(req.user.businessId);res.json({user:publicUser(req.user,b)});} catch(e){sanitizeError(e,res);}
});
function toClient(row) {return {id:String(row._id),amountPaise:row.amountPaise,date:row.date,description:row.description,paymentMethod:row.paymentMethod,category:row.category,createdAt:row.createdAt.toISOString()};}
app.get('/api/ledger',auth,async(req,res)=>{
  try {
    const rows=await Transaction.find({businessId:req.user.businessId}).sort({date:-1,createdAt:-1}).lean();
    res.json({version:1,sales:rows.filter(x=>x.kind==='sales').map(toClient),expenses:rows.filter(x=>x.kind==='expenses').map(toClient)});
  } catch(e){sanitizeError(e,res);}
});
app.get('/api/dashboard',auth,async(req,res)=>{
  try {
    const from=String(req.query.from||'0000-01-01'),to=String(req.query.to||'9999-12-31');
    if (from !== '0000-01-01' && !validDate(from) || to !== '9999-12-31' && !validDate(to)) return fail(res,400,'Invalid date filter.');
    const rows=await Transaction.find({businessId:req.user.businessId,date:{$gte:from,$lte:to}}).lean();
    res.json(summarize(rows));
  } catch(e){sanitizeError(e,res);}
});
for (const kind of ['sales','expenses']) {
  app.get(`/api/${kind}`,auth,async(req,res)=>{
    try {const rows=await Transaction.find({businessId:req.user.businessId,kind}).sort({date:-1,createdAt:-1});res.json(rows.map(toClient));}
    catch(e){sanitizeError(e,res);}
  });
  app.post(`/api/${kind}`,auth,async(req,res)=>{
    try {const row=validateRow(kind,req.body||{});const saved=await Transaction.create({...row,businessId:req.user.businessId,createdBy:req.user._id});res.status(201).json(toClient(saved));}
    catch(e){if (e.message && (e.message.startsWith('Invalid') || e.message.startsWith('Amount') || e.message.startsWith('Description'))) fail(res,400,e.message);else sanitizeError(e,res);}
  });
  app.put(`/api/${kind}/:id`,auth,async(req,res)=>{
    try {
      const row=validateRow(kind,req.body||{});
      const saved=await Transaction.findOneAndUpdate({_id:req.params.id,businessId:req.user.businessId,kind},{$set:row},{new:true,runValidators:true});
      if (!saved) return fail(res,404,'Record not found.');res.json(toClient(saved));
    } catch(e){if(e?.name==='CastError')return fail(res,404,'Record not found.');if(e.message?.startsWith('Invalid')||e.message?.startsWith('Amount')||e.message?.startsWith('Description'))return fail(res,400,e.message);sanitizeError(e,res);}
  });
  app.delete(`/api/${kind}/:id`,auth,async(req,res)=>{
    try {const deleted=await Transaction.findOneAndDelete({_id:req.params.id,businessId:req.user.businessId,kind});if(!deleted)return fail(res,404,'Record not found.');res.json({message:'Deleted successfully.'});}
    catch(e){if(e?.name==='CastError')return fail(res,404,'Record not found.');sanitizeError(e,res);}
  });
}
app.use('/api',(_,res)=>fail(res,404,'API endpoint not found.'));
app.use((err,req,res,next)=>sanitizeError(err,res));
const PORT=Number(process.env.PORT||5000);
export {app};
if (process.argv[1] && import.meta.url === new URL('file://'+process.argv[1]).href) {
  if (!secret || secret.length<32) {console.error('Set JWT_SECRET to a random string at least 32 characters long in backend/.env');process.exit(1);}
  if (!process.env.MONGODB_URI) {console.error('Set MONGODB_URI in backend/.env');process.exit(1);}
  try {await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:9000});app.listen(PORT,()=>console.log(`SBMS API listening on http://localhost:${PORT}`));}
  catch(e){console.error('MongoDB connection failed:',e.message);process.exit(1);}
}
