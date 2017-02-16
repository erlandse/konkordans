class Bucket{
  key: string;
  doc_count:number;
}

class ElasticClass {
  numFound: number;
  rootObject = null;

  constructor (rootOb){
    this.rootObject = rootOb;
  }

  getDocCount(){
         return this.rootObject.hits.total;
  }

  getFacetFieldWithFacetName(nameOfField:string){
    let list: Bucket[];//her skulle vere bucket
    try{
      list = eval("this.rootObject.aggregations."+nameOfField+".buckets");
      return list;

    }catch(e){
      return list;
    }
  }
  
  getDocs(){
    let p: Object[];
    try{
      p = eval("this.rootObject.hits.hits");
      return p;
    }catch(e){
       return p;
    }    
  }
  
  getArrayFromDoc(doc:any,nameOfField:string){
    return eval("doc._source."+nameOfField)==null?new Array():eval("doc._source."+nameOfField);
  }
  
  getSingleFieldFromDoc(doc:any, nameOfField:string){
    return eval("doc._source."+ nameOfField)==null?"":eval("doc._source."+ nameOfField);
  }

  getHighlightFieldFromDoc(doc:any,nameOfField:string){
     return eval("doc.highlight."+ nameOfField)==null?new Array():eval("doc.highlight."+ nameOfField);
  }

  getMetadataFieldFromDoc(doc:any,nameOfField:string){
     return eval("doc."+ nameOfField)==null?"":eval("doc."+ nameOfField);
  }
 

}
 //export = ElasticClass;
