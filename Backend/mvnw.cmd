@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.

@echo off
setlocal enableextensions enabledelayedexpansion

@REM mvnw.cmd está dentro de backend/, então a raiz do wrapper é o próprio diretório.
for %%i in ("%~dp0.") do set "DIRNAME=%%~fi"

set MVNW_REPOURL=https://repo.maven.apache.org/maven2
if not "%MVNW_REPOURL%" == "" (
    set "MVNW_REPOURL=%MVNW_REPOURL%/"
)

set "wrapperUrl=%MVNW_REPOURL%io/takari/maven-wrapper/0.5.6/maven-wrapper-0.5.6.jar"
set "WRAPPER_JAR=%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPERTIES=%DIRNAME%\.mvn\wrapper\maven-wrapper.properties"

if exist "%WRAPPER_JAR%" (
    if "%MVNW_VERBOSE%" == "true" (
        echo Found %WRAPPER_JAR%
    )
) else (
    if not "%MVNW_REPOURL%" == "" (
        echo Downloading from: %wrapperUrl%
        powershell -Command "&{"^
            "$webclient = new-object System.Net.WebClient;"^
            "if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
            "$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
            "}"^
            "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;"^
            "$webclient.DownloadFile('%wrapperUrl%', '%WRAPPER_JAR%')"^
            "}"
        if "%ERRORLEVEL%" == "0" (
            if "%MVNW_VERBOSE%" == "true" (
                echo Successfully downloaded %WRAPPER_JAR%
            )
        ) else (
            echo Failed to download %wrapperUrl%
            exit /b 1
        )
    )
)

@REM Execute the Maven build
"%JAVA_HOME%\bin\java.exe" ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%DIRNAME%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

exit /b %ERROR_CODE%
