var should = require('should'),
	parser = require('../resource-compiler.js')



describe('resource-compiler', function(){

	describe('identifying resources', function(){

		
		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='a'></resource>")).should.have.length(1)
		})

		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='b'>non empty</resource>")).should.have.length(1)
		})

		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='c'></resource>")).should.have.length(1)
		})

		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='d'>a/r/n b</resource>")).should.have.length(1)
		})

		// Multiple 
		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='yo'>a</resource>b<resource name='yeah'>c</resource>")).should.have.length(2)
		})

		it('should parse', function(){
			Object.keys(parser._findResources("<resource name='pu'>X\r\n</resource>Y<resource name='po'>\nZ</resource>")).should.have.length(2)
		})

	})


	describe('decoding tag properties', function(){

		it('should decode', function(){
			var str = '<resource name="aname" type="atype">blah</resource>'
			obj = parser._findResources(str)

			obj['aname'].should.exist

			obj.aname.name.should.equal('aname')
			obj.aname.type.should.equal('atype')
			obj.aname.content.should.equal('blah')

		})

	})


	describe('decoding resources', function(){

		it('should parse and remove resources iteratively', function(){

			var str = 'before<resource name="aname" type="atype">content</resource>after<resource name="bname" type="btype">content2</resource>noon'
			
			var resources = parser._findResources(str)
			str = parser._removeResourceText(str, resources)

			str.should.equal('beforeafternoon')
		})

	})

	
	describe('subsituting in from a dictionary', function(){

		it('should work', function(){
	
			var dict = {
				a : {
					name : "a",
					type : "text",
					content : "contentA"
				},
				b_bb : {
					name : "b_bb",
					type : "text",
					content : "contentB"
				}
			}

			var str = "x<<a>>y<<b_bb>>z"

			var targets = parser._findTargets(str)
			str = parser._replaceTargets(str, targets, dict)
			str.should.equal('xcontentAycontentBz')

		})

	})


	describe('finding and replacing', function(){


		it('should work', function(){
			
			var str = ['{ "message" : "hello <<username>>" }',
					   '<resource name="username">Joe Hilling</resource>'].join('\n')
			
			var resources = parser._findResources(str)
			str = parser._removeResourceText(str, resources)
			var targets = parser._findTargets(str)
			var str = parser._replaceTargets(str, targets, resources)

			var obj = JSON.parse(str)
			decodeURI(obj.message).should.equal('hello Joe Hilling')
		})
	})

	describe('getting the right information back', function(){

		it('should work', function(){

			var str = ['{ "message" : "hello <<username>>" }',
					   '<resource name="username">Joe Hilling</resource>'].join('\n')
			
			var out = parser(str)

			out.resources.username.replacement.should.equal('Joe Hilling')
		})

	})

	describe('modify the dictionary', function(){

		it('should work', function(){

			var str = ['hello <<username>><resource name="username">Joe Hilling</resource>'].join('\n')
			
			var out = parser(str)

			// inserts encoded
			out.value().should.equal('hello Joe Hilling')

			out.resources.username.replacement ='Monty'

			out.value().should.equal('hello Monty')


		})

	})



})