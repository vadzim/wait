#!/usr/bin/env node

import path from "path"
import fs from "fs"
import program from "commander"

program
	.version(JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")).version)
	.usage("<time>")
	.usage("time is a number with optional suffix. Suffix can be s - seconds, default, m - minutes, h - hours, d - days.")
	.option("-s, --silent", "no count down")
	.parse(process.argv)

const suffixes = {
	s: 1,
	m: 60,
	h: 3600,
	d: 3600 * 24,
}

const wait = program.args
	.map(t => {
		const m = t.match(/^\s*(\d+\.?\d*)([smhd]?)\s*$/)
		if (!m) {
			throw new Error("Wrong argument")
		}
		return Number(m[1]) * suffixes[m[2] || "s"]
	})
	.reduce((a, b) => a + b, 0)

const stop = Date.now() + wait * 1000

const sleep = (ms, noref) => new Promise(resolve => setTimeout(resolve, ms))

const blank = new Array(10).join(" ")

void (async function() {
	while (stop > Date.now()) {
		if (!program.silent) {
			printLeft()
		}
		await sleep((stop - Date.now()) % 1000 || 1000)
	}
	if (!program.silent) {
		process.stdout.write("\r" + blank + "\r")
	}
})()

function printLeft() {
	const left = Math.round((stop - Date.now()) / 1000)
	const message = formatSeconds(left)
	process.stdout.write(message + blank + "\r" + message)
}

function formatSeconds(s) {
	let text = "\r"
	if (s >= suffixes.d) {
		const days = Math.floor(s / suffixes.d)
		text += days + "d "
		s -= days * suffixes.d
	}
	if (s >= suffixes.h) {
		const hours = Math.floor(s / suffixes.h)
		text += hours + ":"
		s -= hours * suffixes.h
	}
	text += String(Math.floor(s / suffixes.m)).padStart(2, "0") + ":" + String(s % suffixes.m).padStart(2, "0")
	return text
}
