var tagParser = require('tag-parser')

function findResources(str){

	var tags = tagParser(str)

	var tagDict = {}

	tags.forEach(function(t){

		// Only interested in resource tags
		if(t.name !== 'resource') return

		if(!t.properties.name) throw new Error('Resource without name')

		// Could do a TODO for unidentified properties

		tagDict[t.properties.name] = {
			name    : t.properties.name,
			type    : t.properties.type,
			content : t.content.trim(),
			text    : t.text
		}

	})

	return tagDict
}


// Regular expression for resources
// --------------------------------
var TARGET_REG_EXP = /<<[ \t]*(\w+)[ \t]*>>/ig


function identifyTargets(str){
	
	var targets = {}
	var match = TARGET_REG_EXP.exec(str)
	while(match !=null){
		targets[match[1]] = match[0]
		match = TARGET_REG_EXP.exec(str) // Update
	}
	return targets				

}



function removeResourceText(str, resources){
	
	for(name in resources){
		var target = resources[name].text
		if(target) str = str.replace(target,'')
	}
	return str

}


function replaceTargets(str, targets, resources){
	
	for(name in targets){
		var targetText = targets[name]
		if(resources[name]){
			var replacementText = resources[name].content
			// console.log('\nreplacement:',replacementText)
			str = str.replace(targetText, encodeURI(replacementText))
		}
	}

	return str
}


// Export function
var parser = function(str, rdict){
	if(!str) throw new Error('Cannot parse - undefined')

	var resources = findResources(str)
	str = removeResourceText(str, resources)

	var targets = identifyTargets(str)

	if(rdict) resources = _.extend(rdict, resources)

	str = replaceTargets(str, targets, resources)

	return str

}

parser._targetRegExp       = TARGET_REG_EXP
parser._removeResourceText = removeResourceText
parser._findResources      = findResources
parser._findTargets    = identifyTargets
parser._replaceTargets     = replaceTargets

module.exports = parser