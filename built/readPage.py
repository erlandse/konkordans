import os
import sys
import codecs
import Tools
import json
from os import listdir
from os.path import isfile, join

reload(sys)
sys.setdefaultencoding( "utf-8" )

UTF8Writer = codecs.getwriter('utf8')
sys.stdout = UTF8Writer(sys.stdout)

path = sys.argv;
file = path[1];
offset= int(path[2]);
lines =  int(path[3]);

try:
  inputFile = codecs.open(file,"r","utf-8")
except:
  raise ValueError(fileName)

resultLines = "";
if(offset > 0):
  inputFile.seek(offset-5);
  inputFile.readline();
else:
  inputFile.seek(offset);
lineArray = list();
for num in range (0,lines):
  l = inputFile.readline();
  if not l: break;
  lineArray.insert(num,l);
dict = dict()
dict['startOffset'] = offset;
dict['endOffset'] = inputFile.tell();
dict['lines'] =lineArray;
json1 = json.dumps(dict);

inputFile.close()
try:
  outputFile = codecs.open(file+".json","w","utf-8")
except:
  raise ValueError(file)
outputFile.write(json1)
outputFile.close();
