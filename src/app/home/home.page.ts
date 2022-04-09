import { Component } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert';
import { article } from '../article';
//import { article } from './article';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
 
export class HomePage {
  resolvedFlag = true; 
  scannedBarCode ;
  article:any;
  listOF:any[]= []
  articles1:any[]= [];
  articles:any[]= [];
  num_reg: string[];
  qte;
  items:any[]= [];
  listId:any[]= [];
  idof;
  doc_num="";
  q;
  k=1;
  public showCamera = false;
  SERVER_URL1 = 'http://192.168.1.6:5000';
  public textScanned: string = '';
  constructor( 
    private qrScanner: BarcodeScanner,
    public alertController: AlertController,private http: HttpClient) {  
      
       this.showCamera = true;
      // Optionally request the permission early
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showTorchButton: true,
        showFlipCameraButton: true,
        torchOn: false,
        prompt: 'Place a barcode inside the scan area',
        formats: 'EAN_13,EAN_8,QR_CODE,PDF_417',
        orientation: 'portrait',
      };
      
      this.qrScanner.scan(options).then(res => {
        let k:any=1;
          this.scannedBarCode = res;
          var str = new String(this.scannedBarCode["text"]);
          this.num_reg=str.split("*");
          if(str===undefined||str.split('*').length-1 !=4){
            swal({
              title:"Opps",
              text: "le code que vous scannez est invalide !!!",
              icon: "warning",
            }).then(willDelete => {
           this.scanCode();})
          
          }
           else{
          this.q=this.num_reg[0]+"*"+this.num_reg[1]+"*"+this.num_reg[4]
          this.article = this.num_reg[2]+" "+this.num_reg[1];
          this.listOF.push(this.num_reg[4]+"*"+this.article);
          this.articles1.push(this.num_reg[2]);
          this.articles.push(this.article);
          this.showCamera = false;
        }
        }).catch(err => {
          alert("err"+err);
        });
    }
    scanCode() {
      this.showCamera = true;
      // Optionally request the permission early
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showTorchButton: true,
        showFlipCameraButton: true,
        torchOn: false,
        prompt: 'Place a barcode inside the scan area',
        formats: 'EAN_13,EAN_8,QR_CODE,PDF_417',
        orientation: 'portrait',
      };
      this.qrScanner.scan(options).then(async res => {
          this.scannedBarCode = res;
          var str = new String(this.scannedBarCode["text"]);
          await  this.num_reg.splice(0,this.num_reg.length);
          this.num_reg=str.split("*");
          if(this.num_reg===undefined || str.split('*').length-1 !=4 ){
            swal({
              title:"Opps",
              text: "le code que vous scannez est invalide !!!",
              icon: "warning",
            }).then(willDelete => {
           this.scanCode();})
          }
          else{
          this.article = this.num_reg[2]+" "+this.num_reg[1];
           if (this.articles1.indexOf(this.num_reg[2]) > -1){
            this.k=this.k+1;
            this.listOF.push(this.num_reg[4]+"*"+this.article);
            this.articles1.push(this.num_reg[2]);
            this.articles.push(this.article);

           }else{
            alert ('client different')
          }
          this.showCamera = false;}
        }).catch(err => {
          alert(err);
        });  
     
    }
  promise =function clearBL() { 
     this.http.get(this.SERVER_URL1+'/clearBL').subscribe((res)=>{})
     return new Promise((resolve ,reject)=>{
      setTimeout(
          ()=>{
              console.log("Inside the promise");
              if(this.resolvedFlag==true){
                  resolve("Resolved");
              }else{
                  reject("Rejected")
              }     
          } , 2000
      );
  });
  }
  promis =function  getData() {
    this.ajouter();
    return new Promise((resolve ,reject)=>{
      setTimeout(
          ()=>{
              console.log("Inside the promise");
              if(this.resolvedFlag==true){
                  resolve("Resolved");
              }else{
                  reject("Rejected")
              }     
          } , 5000
      );
  });
  }
  ajouterbl(){
    
    this.alertController.create({
      header: 'Es-tu sûr?',
      cssClass:'alertCancel',
      subHeader: '',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          cssClass: 'alertButton',
          handler: () => {
            console.log('I care about humanity');
          }
        },
        {
          text: 'ok!',
          cssClass: 'alertButton',
          handler: (data: any) => {
            console.log('Saved Information',
          
            this.promis().then(res => {
              this.http.get(this.SERVER_URL1+'/ajouterEnteteBL/'+this.doc_num).subscribe((res)=>{
                if(res["msg"]== "error"){
                  swal({
                    title: "Opps",
                    text: "Erreur de connexion au serveur !",
                    icon: "error",
                  })
                }else if(res["msg"]== "true"){
                  swal({
                    title:"Bon travail !",
                    text:"informations enregistrées", 
                    icon:"success"
                  })
                }else if(res["msg"]== "false"){
                  swal({
                    title: "Opps",
                    text: "aucune article !",
                    icon: "error",
                  })
                }
              })} ).catch(err => console.log(err)));
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }
  ajouter(){ 
    const counts = {};
    for (const num of this.listOF) {
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    // call clear endpoint
    
     this.promise().then(res => {
      let i=1
      for (let j in counts){
        this.http.get(this.SERVER_URL1+'/qte/'+j).subscribe( (res) => { 
          if(res["msg"]== "error"){
            swal({
              title: "Opps",
              text: "Erreur de connexion au serveur !",
              icon: "error",
            })
          }else{
        
         if(counts[j]>0  && counts[j] <= Number(res["Reliquat"])){
          res["detailsOF"][0]["OFD_Q"]=counts[j]
          
          this.items.push(res["detailsOF"]);
          this.http.get(this.SERVER_URL1+'/ajouterBL/'+counts[j]+"*"+res["detailsOF"][0]["OFD_Id"]+"*"+res["detailsOF"][0]["Doc_Num"]+"*"+i).subscribe((res)=>{
            if(res["msg"]== "error"){
              swal({
                title: "Opps",
                text: "Erreur de connexion au serveur !",
                icon: "error",
              })
            }
          })
          
          i=i+1;
          this.doc_num=res["detailsOF"][0]["Doc_Num"]+"*"+res["detailsOF"][0]["OFD_Id"]+"*"+counts[j]+"*true"
        }else if(Number(res["Reliquat"])==0){
           alert ("aucune article")
           this.doc_num=res["detailsOF"][0]["Doc_Num"]+"*"+res["detailsOF"][0]["OFD_Id"]+"*"+counts[j]+"*false"
         }
         else if (counts[j]>0  && counts[j] == Number(res["Reliquat"])){
          
          this.items.push(res["detailsOF"])
          this.http.get(this.SERVER_URL1+'/ajouterBL/'+res["detailsOF"][0]["OFD_Q"]+"*"+res["detailsOF"][0]["OFD_Id"]+"*"+res["detailsOF"][0]["Doc_Num"]+"*"+i).subscribe((res)=>{
            if(res["msg"]== "error"){
              swal({
                title: "Opps",
                text: "Erreur de connexion au serveur !",
                icon: "error",
              })
            }
          })
          i=i+1;
          this.doc_num=res["detailsOF"][0]["Doc_Num"]+"*"+res["detailsOF"][0]["OFD_Id"]+"*"+res["detailsOF"][0]["OFD_Q"]+"*false"
        }}
      }),console.error();

      
    }
    }).catch(err => console.log(err))
   
} 

alert(){
  
this.items.forEach(element => {
  alert(element[0]["OFD_Q"] )
})

}
  public deleteObject(objectIndex) {
    this.listOF = this.listOF.filter( (item, index) => {
       if (index !== objectIndex) return true;
       this.k=this.k-1
    })
    this.articles1 = this.articles1.filter( (item, index) => {
       if (index !== objectIndex) return true;
    })
    if(this.articles1.length > 0){
      
    }else{
      window.location.reload();
    }
}
doRefresh(event) {
  setTimeout(() => {
    this.ajouterbl()
    event.target.complete();
  }, 2000);
}
}
