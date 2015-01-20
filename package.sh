#!/bin/sh

sudo npm install -g node-gyp n
npm install
n v0.11.14

version=$(node -pe "require(process.argv[1]).version" ./package.json)
dl="http://dl.nwjs.io/v0.11.5/node-webkit-v0.11.5-osx-x64.zip"
cwd=$(pwd)

cd node_modules/keytar
nw-gyp clean
nw-gyp configure --target=0.11.5 --arch=x64
nw-gyp build
cd $cwd

mkdir -p output && cd output
curl -vvv $dl -o nw.zip
rm -R Pussh.app
unzip nw.zip && mv node-*/node-webkit.app Pussh.app && rm -R node-*

cd $cwd
zip --exclude=output* -x=.git* -r output/app.nw .
cd output

cp app.nw Pussh.app/Contents/Resources/app.nw
cp ../Resources/img/icon.icns Pussh.app/Contents/Resources/nw.icns
cp ../Resources/pkg/Info.plist Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" Pussh.app/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $version" Pussh.app/Contents/Info.plist
rm app.nw
rm nw.zip