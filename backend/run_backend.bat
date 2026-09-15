@echo off
echo ====================================================
echo  Starting Java Spring Boot Backend Server
echo ====================================================
mvn spring-boot:run
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Maven not found or build failed.
    echo Please ensure Maven is installed or Java JDK 17+ is set in PATH.
    pause
)
