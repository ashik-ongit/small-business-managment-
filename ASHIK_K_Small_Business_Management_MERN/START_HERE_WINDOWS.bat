@echo off
cd /d "%~dp0"
echo ==================================================
echo SMALL BUSINESS MANAGEMENT SYSTEM - ASHIK K
 echo ==================================================
 echo.
echo FIRST TIME SETUP: npm install
 echo BACKEND INSTALL: npm --prefix backend install
 echo Copy backend\.env.example to backend\.env
 echo Edit backend\.env: MongoDB URL and JWT_SECRET
 echo Start local MongoDB service or use MongoDB Atlas
 echo Optional demo data: npm run seed
 echo.
echo When ready, this will launch the frontend and backend.
pause
call npm run dev:all
pause
