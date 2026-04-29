#!/usr/bin/env node
import transformStream from "../build/transformStream.js"

transformStream(process.stdin, process.stdout)
