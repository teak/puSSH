#!/bin/sh

sudo npm install -g node-gyp nw-gyp n
npm install
n v0.12.0

version=$(node -pe "require(process.argv[1]).version" ./package.json)
dl="http://dl.nwjs.io/v0.12.0/nwjs-v0.12.0-osx-x64.zip"
cwd=$(pwd)

cd node_modules/keytar
nw-gyp clean
nw-gyp configure --target=0.12.0 --arch=x64
nw-gyp build
cd $cwd

mkdir -p output && cd output
curl -vvv $dl -o nw.zip
rm -R Pussh.app
unzip nw.zip && mv nwjs-*/nwjs.app Pussh.app && rm -R nwjs-*

cd $cwd
zip --exclude=output* -x=.git* -r output/app.nw .
cd output

cp app.nw Pussh.app/Contents/Resources/app.nw
cp ../Resources/img/icon.icns Pussh.app/Contents/Resources/nw.icns
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Pussh" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.nightdev.pussh" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleDocumentTypes:0:CFBundleTypeName Pussh" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleDocumentTypes:0:LSItemContentTypes:0 com.nightdev.pussh.app" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :UTExportedTypeDeclarations:0:UTTypeDescription Pussh" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :UTExportedTypeDeclarations:0:UTTypeIdentifier com.nightdev.pussh.app" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $version" Pussh.app/Contents/Info.plist
rm app.nw
rm nw.zip