sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library","sap/m/MessageBox"],function(e,t,s,a,o,i,r,n,l){"use strict";var u=i.ButtonType;var c=i.DialogType;var g=n.ValueState;return e.extend("frontend.bbs.controller.materialRequest.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched,this);const t=this.getOwnerComponent().getEventBus()},_onObjectMatched:function(e){const t=this.getOwnerComponent().getEventBus();var a=this.getOwnerComponent().getModel("globalModel").getData();this.path="";if(a["MRpath"]!=null||a["MRpath"]!=""){this.path=a["MRpath"]}var o=new s({showFooter:false,editable:false,resubmit:false,is_finance:false});this.getView().setModel(o,"viewModel");var i=new s;i.setSizeLimit(999999);this.getView().setModel(i,"items");var r=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=r.get("jwt");this.company=r.get("company");var n=new s;this.getView().setModel(n,"accounts");this.materialRequestCode=e.getParameter("arguments").materialRequestID;var l=this.getOwnerComponent().getModel("userModel");if(l===undefined){t.subscribe("username","checktoken",this.buildForm,this)}else{var u=l.getData();var c={userName:u.user.name,roleId:u.user.role_id,roleName:u.role[0].name,status:"success"};this.buildForm("username","checkToken",c)}},buildForm:function(e,t,a){console.log(a);if(a.status=="error"){alert("Error");this.getView().byId("materialRequestPageID").setBusy(false)}var o=this.materialRequestCode;var i=this.getView().getModel("viewModel");if(this.materialRequestCode===undefined){var r=window.location.href;var n=r.split("/");this.materialRequestCode=n[n.length-1]}const l=new s;this.getView().setModel(l,"materialRequestDetailModel");l.loadData(backendUrl+"materialRequest/getMaterialRequestById",{code:this.materialRequestCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});l.dataLoaded().then(function(){var e=this.getView().getModel("materialRequestDetailModel").getData();var t=this.getView().byId("materialReqLineTableID");t.setVisibleRowCount(e.MATERIALREQLINESCollection.length);if(a.roleId==4){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==2){i.setProperty("/showFooter",true)}}else if(a.roleId==5){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==1){i.setProperty("/showFooter",true)}}else if(a.roleId==3){i.setProperty("/is_approver",false);i.setProperty("/is_requestor",true);i.setProperty("/resubmit",false);if(e.U_Status==4){i.setProperty("/resubmit",true)}if(e.U_Status==4||e.U_Status==1){i.setProperty("/showFooter",true);i.setProperty("/editable",true)}}else if(a.roleId==2){i.setProperty("/is_approver",false);i.setProperty("/is_requestor",false);i.setProperty("/showFooter",true);i.setProperty("/is_finance",true)}let o=new s;this.getView().setModel(o,"budget");o.loadData(backendUrl+"budget/getBudgetById?",{code:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var r=new s;r.loadData(backendUrl+"getBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(r,"budgeting");var n=this.getView().getModel("accounts");n.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});n.refresh();var l=this.getView().getModel("items");l.setSizeLimit(999999);l.setProperty("/data",[]);var u=l.getData();var c=new s;c.setSizeLimit(999999);var g=[];if(e.MATERIALREQLINESCollection.length>0){for(let t=0;t<e.MATERIALREQLINESCollection.length;t++){if(e.MATERIALREQLINESCollection[t].U_AccountCode){if(!(e.MATERIALREQLINESCollection[t].U_AccountCode.toString()in g)){g.push(e.MATERIALREQLINESCollection[t].U_AccountCode)}}}var d=[...new Set(g)];for(let e=0;e<d.length;e++){c.loadData(backendUrl+"items/getItemsByAccount",{company:this.company,accountCode:d[e]},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});c.dataLoaded().then(function(){var t=c.getData();u.data[d[e]]=t;var s=new sap.ui.model.json.JSONModel(u);s.setSizeLimit(5e3);this.getView().setModel(s,"items");s.refresh()}.bind(this))}for(let s=0;s<e.MATERIALREQLINESCollection.length;s++){if(e.MATERIALREQLINESCollection[s].U_AccountCode){let a=e.MATERIALREQLINESCollection[s].U_AccountCode.toString();t.getRows()[s].getCells()[1].bindAggregation("items",{path:"items>/data/"+a,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})})}}}}.bind(this))},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onApproveButtonClick:function(){var e=this.getView().byId("materialRequestPageID");var t=this.getView().getModel("viewModel");e.setBusy(true);const s=this.getView().getModel("materialRequestDetailModel");const i=this.getOwnerComponent().getModel("materialRequest");var n=this.path;var d=s.getProperty("/");var h=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,oProperty:d}),headers:{Authorization:"Bearer "+h,Accept:"application/json; charset=utf-8"},crossDomain:true,url:backendUrl+"materialRequest/approveMR",contentType:"application/json",success:function(l,d,h){e.setBusy(false);if(i){i.setProperty(n+"/U_Status",l["U_Status"])}s.setData(l);s.refresh();if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:g.Success,content:new r({text:"Material Request approved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});t.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(t,s,a){e.setBusy(false);l.error(t.responseJSON.msg)}})},onRejectButtonClick:function(e){if(!this.rejectMaterialRequestDialog){this.rejectMaterialRequestDialog=this.loadFragment({name:"frontend.bbs.view.materialRequest.RejectForm"})}this.rejectMaterialRequestDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("materialRequestPageID");e.setBusy(true);var t=this.getView().getModel("materialRequestDetailModel");var s=t.getData();var i=this.getView().byId("rejectDialog");var n=s.Code;var d=this.getView().byId("RejectionRemarksID").getValue();var h=this.getView().getModel("viewModel");const p=this.getOwnerComponent().getModel("materialRequest");var m=this.path;$.ajax({type:"POST",data:{Code:n,Remarks:d,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"materialRequest/rejectMR",success:function(s,n,l){e.setBusy(false);i.close();if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:g.Success,content:new r({text:"Material Request rejected"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){h.setProperty("/showFooter",false);if(p){p.setProperty(m+"/U_Status",s["U_Status"])}t.setData(s);t.refresh();this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(t,s,a){e.setBusy(false);l.error(t.responseJSON.msg)}})},onAddPress:function(e){const t=this.getView().getModel("materialRequestDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_Qty:""};s.MATERIALREQLINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"materialRequestDetailModel");o.refresh()},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("materialRequestDetailModel");var o=a.getData().MATERIALREQLINESCollection;o.splice(s,1);a.setProperty("/MATERIALREQLINESCollection",o);a.refresh()},onSaveButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,data:s.getData()}),headers:{Authorization:"Bearer "+i},crossDomain:true,url:backendUrl+"materialRequest/saveMR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:g.Success,content:new r({text:"Material Request saved"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,a){t.setBusy(false);l.error(e.responseJSON.msg)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;var d=this.getView().getModel("viewModel");const h=this.getOwnerComponent().getModel("materialRequest");var p=this.path;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialRequest/resubmitMR",contentType:"application/json",success:function(e,i,n){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:c.Message,title:"Success",state:g.Success,content:new r({text:"Material Request resubmitted"}),beginButton:new o({type:u.Emphasized,text:"OK",press:function(){d.setProperty("/showFooter",false);d.setProperty("/editable",false);if(h){h.setProperty(p+"/U_Status",e["U_Status"])}s.setData(e);s.refresh();this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,a){t.setBusy(false);l.error(e.responseJSON.msg)}})},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),a=t.getValue();if(!s&&a){t.setValueState(g.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(g.None)}if(t.getValueState()==g.None){this.getView().byId("materialRequestPageID").setBusy(true);var o=this.getView().getModel("accounts");o.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:s,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});o.refresh();var i=parseInt(e.getParameters("selectedItem").value);var r=this.getView().getModel("budget");await r.loadData(backendUrl+"budget/getBudgetById",{code:i,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});r.refresh();this.getView().byId("materialRequestPageID").setBusy(false)}},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setSelectedKey("");a.getCells()[1].setBusy(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");o.setSizeLimit(5e3);var i=o.getData();if(!(t in i)){var r=new s;r.setSizeLimit(5e3);await r.loadData(backendUrl+"items/getItemsByAccount",{accountCode:t,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.setSizeLimit(1e4);l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},handlePrintButtonPressed:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,code:this.materialRequestCode}),headers:{Authorization:"Bearer "+s},crossDomain:true,url:backendUrl+"materialRequest/printMR",contentType:"application/json",responseType:"arraybuffer",success:function(e,s,a){t.setBusy(false);var o=atob(e);var i=new Array(o.length);for(var r=0;r<o.length;r++){i[r]=o.charCodeAt(r)}var n=new Uint8Array(i);var l=new Blob([n],{type:"application/pdf;base64"});var u=URL.createObjectURL(l);window.open(u)},error:function(e,s,a){t.setBusy(false);l.error(e.responseJSON.msg)}})},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}}})});