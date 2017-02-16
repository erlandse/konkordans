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
samples= int(path[2]);

try:
  inputFile = codecs.open(file,"r","utf-8")
except:
  raise ValueError(file)

fileSize = os.path.getsize(file)

print fileSize

offsetToAdd = fileSize / samples
offset=0

lineArray = list()

inputFile.seek(0)
dic = dict()
dic['offset'] = offset
l = inputFile.readline()
ls = l.split("\t")
dic['line'] = ls[0]
lineArray.insert(0,dic)

for num in range (1,samples):
  offset += offsetToAdd
  inputFile.seek(offset)
  try:
    l = inputFile.readline()
  except:
    while True:
      x = inputFile.read(1)
      if not x:break
      if x=="\n":break
  dic = dict()  
  dic['offset'] = inputFile.tell()
  l = inputFile.readline()
  if not l:break
  print l
  ls = l.split("\t")
  dic['line'] = ls[0]
  lineArray.insert(num,dic)
dic = dict()
dic['samples'] = lineArray 
dic['filelength'] = fileSize
json1 = json.dumps(dic);
inputFile.close()

try:
  outputFile = codecs.open(file+"_sample.json","w","utf-8")
except:
  raise ValueError(file)
outputFile.write(json1)
outputFile.close();
