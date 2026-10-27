import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {User,Business,Transaction} from './models.js';
const EMAIL='ashik.demo@example.com';
if(!process.env.MONGODB_URI){console.error('Set MONGODB_URI in backend/.env');process.exit(1);}
await mongoose.connect(process.env.MONGODB_URI);
const business=await Business.findOneAndUpdate({ownerEmail:EMAIL},{$setOnInsert:{name:'Ashik Demo Store',ownerEmail:EMAIL}},{upsert:true,new:true});
const user=await User.findOneAndUpdate({email:EMAIL},{$set:{name:'Ashik Demo',passwordHash:await bcrypt.hash('Demo@12345',12),businessId:business._id,role:'owner'}},{upsert:true,new:true});
let count=await Transaction.countDocuments({businessId:business._id});
if(count===0){
  const make=(kind,amount,date,choice,description)=>({businessId:business._id,createdBy:user._id,kind,amountPaise:Math.round(amount*100),date,description,[kind==='sales'?'paymentMethod':'category']:choice});
  const rows=[];
  for (let mi=7;mi<=10;mi++) {
    const month=String(mi).padStart(2,'0');
    for (let d of [3,8,12,17,22,27]) {
      rows.push(make('sales',4100+mi*240+d*45,`2026-${month}-${String(d).padStart(2,'0')}`,['Cash','UPI','Card'][d%3],'Retail counter sales'));
    }
    for(const [i,c,amount] of [['05','Rent',15000],['08','Electricity',3200],['12','Stock',21000+mi*350],['28','Staff Salary',14000]])rows.push(make('expenses',amount,`2026-${month}-${i}`,c,`${c} expense`));
  }
  await Transaction.insertMany(rows);count=rows.length;
}
console.log(`Demo user: ${EMAIL}  password: Demo@12345; total records: ${count}`);
await mongoose.disconnect();
