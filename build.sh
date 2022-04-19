#!/bin/sh

echo Clean up...
rm -rf .parcel-cache && rm -rf dist
mkdir -p dist/intermediate

echo Bundle shader program...
./node_modules/.bin/glslify src/scene/scene.frag > dist/intermediate/out.frag
./node_modules/.bin/glslify src/scene/scene.vert > dist/intermediate/out.vert

echo Minify shader program...
mono tools/shader_minifier.exe dist/intermediate/out.frag -o dist/intermediate/out.min.frag --format text --preserve-externals
mono tools/shader_minifier.exe dist/intermediate/out.vert -o dist/intermediate/out.min.vert --format text --preserve-externals

echo Bundle app...
./node_modules/.bin/parcel build src/main.ts --no-cache --no-source-maps --no-content-hash --dist-dir dist/intermediate

echo Compress app...
./node_modules/.bin/roadroller dist/intermediate/main.js -o dist/intermediate/main.min.js

echo Concat app to a minimal html...
echo '<style>body{margin:0;display:flex;align-items:center;height:100vh} #c{width:100%}</style><canvas id="c"></canvas><script>' > dist/index.html
cat dist/intermediate/main.min.js >> dist/index.html
echo '</script>' >> dist/index.html

wc -c dist/index.html
