#!/bin/bash
ffmpeg -i src/tekkno2.mp3 -f null - 2>&1 >/dev/null | grep time=