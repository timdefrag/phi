var fs = require('fs');
var ugl = require('uglify-js');
var parser = require('../peg/parser/phi');


var Passes = ['shapes', 'build'];

var Childs = {
  Spell: ['args'],
  List: ['items'],
  Hash: ['pairs'],
  Pair: ['key', 'val']
};

var Spells = {
  'add': function(left, right) {
    
  },
  'set': function(targ, val) {
    
  }
};


var TypeProp = 'T';
var NodeTypes = {
  JSAST: {},
  Spell: {
    build: function(node) {
      return Spells[node.id].apply(this, node.args);
    }
  },
  Num: {
    build: function(node) {
      return new ugl.AST_Number({ value: node.val });
    }
  },
  List: {
    shapes: function(node) {
      
    },
    build: function(node) {
      
    }
  }
};


function doPass(pass, node) {
  var i;
  
  if(Array.isArray(node)) {
    for(i=0; i<node.length; i++) 
      node[i] = doPass(pass, node[i])
    return node;
  }
  
  var type = NodeTypes[node[TypeProp]];
  var childs = Childs[type];
  var passFn = type[pass];
  
  if(childs) {
    for(i=0; i<childs.length; i++)
      node[childs[i]] = doPass(pass, node[childs[i]]);
  }
  
  if(passFn)
    return passFn(node);
  
  return node;
}


function compile(node) {
  var i, n = Passes.length;
  for(i=0; i<n; i++)
    node = doPass(Passes[i], node);
  
  return '';
}




var filename = 'demo';

console.log('loading .phi file...');
var data = fs.readFileSync('ex/'+filename+'.phi', 'utf-8');

console.log('parsing...');
var ast = parser.parse(data);

console.log('compiling...');
var source = compile(ast);

console.log('executing...');
eval(source);

console.log('done.');