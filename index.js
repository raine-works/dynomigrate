#!/usr/bin/env node

const AWS = require('aws-sdk')
const _ = require('lodash')

const reqArgs = (expected, rawArgs) => {
	if (expected !== '*') {
		expected.forEach((e, i) => {
			if (e.includes('!') && !rawArgs.includes(e.replace('!', ''))) {
				throw new Error(`${e.replace('!', '')} is a required flag`)
			}
			expected[i] = e.replace('!', '')
		})
	}
	return { rawArgs, expected }
}

const getCliArguments = (exp) => {
	const { rawArgs, expected } = reqArgs(exp, process.argv.splice(2))
	const args = {}

	rawArgs.forEach((e, i) => {
		if (e.charAt(0) === '-') {
			if (expected !== '*' && !expected.includes(e)) {
				throw new Error(`${e} is not an expected flag`)
			} else if (!rawArgs[i + 1] || rawArgs[i + 1].charAt(0) === '-') {
				args[_.camelCase(e)] = 'true'
			} else {
				args[_.camelCase(e)] = rawArgs[i + 1]
			}
		}
	})
	return args
}
const args = getCliArguments([
	'--origin!',
	'--target!',
	'--region!',
	'--profile',
])

const credentials = new AWS.SharedIniFileCredentials({
	profile: args.profile ?? 'default',
})

const dynamodb = new AWS.DynamoDB({
	region: args.region,
	credentials: credentials,
})

const init = async () => {
	const batches = []
	const response = await dynamodb
		.scan({
			TableName: args.origin,
		})
		.promise()
	const items = response.Items

	function batchify(items) {
		while (items.length > 0) {
			batches.push(items.splice(0, 10))
		}
	}

	batchify(items)

	for (const i in batches) {
		await setTimeout(
			(list) => {
				for (const ii in list) {
					setTimeout(
						async (item) => {
							console.log('Inserting Item')
							const results = await dynamodb
								.putItem({
									TableName: args.target,
									Item: item,
								})
								.promise()
							console.log(
								results.$response.httpResponse.statusMessage
							)
						},
						ii * 1000,
						list[ii]
					)
				}
			},
			i * 60000,
			batches[i]
		)
	}
}

init()
