@echo off
cls
rmdir "C:\xampp\htdocs\cinema service test" /s /q
mkdir "C:\xampp\htdocs\cinema service test"
xcopy ".\" "C:\xampp\htdocs\cinema service test" /E
cd "C:\xampp\htdocs\cinema service test\"
rename upload_changes.bat upload_changes.bat.code
echo !
echo !
echo !
echo   project upload completato
echo !
echo !
echo !
echo   il servizio e' ora online all'indirizzo
echo    http://localhost/cinema%%20service%%20test