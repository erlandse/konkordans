import os
import sys
import Tools
import codecs
import json
import errno
import glob
from os import listdir
from os.path import isfile

def addFiles (directory):
  """
  Return a list  of file names from directory with the full path
  """
  onlyFiles = [];
  for f in listdir(directory):
     if isfile(directory+f):
       onlyFiles.append(directory+f)
  return onlyFiles     


def addFilesWithExtention(directory,postfix):
  """
  As input a list of files in directory
  Return oly a list with the files with extention postfix
  """
  onlyFiles = [];
  for f in listdir(directory):
     if isfile(directory+f):
       if f.find(postfix, len(f)-len(postfix),len(f)) != -1:
         onlyFiles.append(directory+f)
  return onlyFiles     

def addFilesWithExtentionNoPath(directory,postfix):
  """
  As input a list of files in directory
  Return oly a list with the files with extention postfix
  """
  onlyFiles = [];
  for f in listdir(directory):
     if isfile(directory+f):
       if f.find(postfix, len(f)-len(postfix),len(f)) != -1:
         onlyFiles.append(f)
  return onlyFiles     


def extractFilesWithExtention(list,postfix):
  """
  As input a list of files in directory
  Return oly a list with the files with extention postfix
  """
  fl = []
  for c in list:
    if c.find(postfix, len(c)-len(postfix),len(c)) != -1:
      fl.append(c)
  return fl    
  
def extractDataFiles(list,formid):

  fl = []
  for c in list:
    try:
      l = os.path.getsize(c)
      file = codecs.open(c,"r","utf-8")
      fileContent = file.read(l)
      p = json.loads(fileContent)
      x=p['form']['formId']
      if x==formid:
        fl.append(c)
      file.close()  
    except:
      file.close()  
  return fl    

def readFile(fileName):
  """
  Open a file with fileName and return the content
  """
  try:
    l = os.path.getsize(fileName)
    file = codecs.open(fileName,"r","utf-8")
    fileContent = file.read(l)
    file.close()
    return fileContent
  except:
    raise ValueError(fileName)

def makeSurePathExists(path):
    """
    Create the directories in the path that does not exist.
    """
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno != errno.EEXIST:
            raise
            
            
def sortDir(path,filePath):
  import glob
  import os
  files = filter(os.path.isfile, glob.glob(path + filePath))
  files.sort(key=lambda x: os.path.getmtime(x),reverse=True)
  return files

def sortFileNames(path,filePath):
  files = filter(os.path.isfile, glob.glob(path + filePath))
  files.sort(key=lambda x: os.path.basename(x),reverse=True)
  return files
