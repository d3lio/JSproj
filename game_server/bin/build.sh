#!/bin/bash
export PYTHON="D:\\Programs\\Python27\\python.exe"
node-gyp configure
node "./bin/helpers/enable_cpp_unwind.js"
node-gyp build