sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library","sap/m/Input","sap/m/TextArea","sap/m/MessageBox"],function(e,t,s,a,i,o,n,r,l,g,c){"use strict";var u=o.ButtonType;var d=o.DialogType;var h=r.ValueState;return e.extend("frontend.bbs.controller.budgeting.Detail",{onInit:async function(){this.currentRoute=this.getOwnerComponent().getRouter().getHashChanger().getHash();this.oStore=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=this.oStore.get("jwt");this.company=this.oStore.get("company");var e=this.getOwnerComponent();var t=new s(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));this.getView().setModel(t,"salesOrder");this.oRouter=e.getRouter();this.userModel=e.getModel("userModel");this.getView().setModel(this.userModel,"userModel");this.oRouter.getRoute("budgetingDetail").attachPatternMatched(this._onObjectMatched,this)},_onObjectMatched:function(e){var t=new s({showFooter:false,editable:false,resubmit:false,is_approver:false,is_requestor:false,is_finance:false});this.getView().setModel(t,"viewModel");this.getView().byId("budgetingPageId").setBusy(true);this.budgetCode=e.getParameter("arguments").budgetID;var a=this.getOwnerComponent().getModel("userModel");if(a===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.buildForm,this)}else{var i=a.getData();var o={userName:i.user.name,roleId:i.user.role_id,roleName:i.role[0].name,status:"success"};this.buildForm("username","checkToken",o)}},buildForm:function(e,t,a){var i=this.company;if(a.status=="error"){alert("Error");this.getView().byId("budgetingPageId").setBusy(false)}var o=this.budgetCode;var n=this.getView().getModel("viewModel");var r=new sap.ui.model.json.JSONModel;r.setSizeLimit(1e3);r.loadData(backendUrl+"main/getPillar",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var l=new sap.ui.model.json.JSONModel;r.dataLoaded().then(function(){var e=r.getData();l.setData(e)});this.getView().setModel(l,"companies");var g=new s;g.setSizeLimit(1e3);g.loadData(backendUrl+"coa/getCOAs",{company:i},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(g,"accounts");if(o===undefined){var c=window.location.href;var u=c.split("/");o=u[u.length-1]}const d=new s;d.loadData(backendUrl+"budget/getBudgetById?",{code:o,company:i},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var h=new s;h.setSizeLimit(1e3);h.loadData(backendUrl+"project/getProjects",{company:i},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(h,"projects");this.getView().setModel(d,"budgetingDetailModel");d.dataLoaded().then(function(){var e=d.getData();if(a.roleId==4){n.setProperty("/editable",false);n.setProperty("/is_approver",true);if(e.U_Status==2){n.setProperty("/showFooter",true)}}else if(a.roleId==5){n.setProperty("/editable",false);n.setProperty("/is_approver",true);if(e.U_Status==1){n.setProperty("/showFooter",true)}}else if(a.roleId==3){n.setProperty("/is_requestor",true);n.setProperty("/resubmit",false);if(e.U_Status==4){n.setProperty("/resubmit",true)}if(e.U_Status==4||e.U_Status==1){n.setProperty("/showFooter",true);n.setProperty("/editable",true)}}else if(a.roleId==2){n.setProperty("/editable",true);n.setProperty("/showFooter",true);n.setProperty("/is_requestor",true);n.setProperty("/is_finance",true);if(e.U_Status==5||e.U_Status==99){n.setProperty("/showFooter",false);n.setProperty("/editable",false)}}var t=this.getView().byId("company").getSelectedItem().getBindingContext("companies").getPath();this.getView().byId("CreatePillar").bindAggregation("items",{path:"companies>/0/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})});this.getView().byId("CreatePillar").setSelectedKey(e.U_PillarCode);var s=this.getView().byId("CreatePillar").getSelectedItem().getBindingContext("companies").getPath();this.getView().byId("CreateClassification").bindAggregation("items",{path:"companies>"+s+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})});this.getView().byId("CreateClassification").setSelectedKey(e.U_ClassificationCode);var i=this.getView().byId("CreateClassification").getSelectedItem().getBindingContext("companies").getPath();this.getView().byId("CreateSubClassification").bindAggregation("items",{path:"companies>"+i+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})});this.getView().byId("CreateSubClassification").setSelectedKey(e.U_SubClassCode);var o=this.getView().byId("CreateSubClassification").getSelectedItem().getBindingContext("companies").getPath();this.getView().byId("CreateSubClassification2").bindAggregation("items",{path:"companies>"+o+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})});this.getView().byId("CreateSubClassification2").setSelectedKey(e.U_SubClass2Code);this.getView().byId("budgetingPageId").setBusy(false);var r=e.BUDGETUSEDCollection;let l=0;if(r.length>0){for(let e=0;e<r.length;e++){l+=Number(r[e]["U_Amount"])}}d.setProperty("/U_TotalUsedBudget",Number(l));var g=Number(e.U_TotalAmount-l);d.setProperty("/U_RemainingBudget",Number(g))}.bind(this))},onProjectChange:function(e){var t=this.getView().getModel("budgetingDetailModel");var s=e.getSource(),a=s.getSelectedKey(),i=s.getValue();if(!a&&i){s.setValueState(h.Error);s.setValueStateText("Please enter a valid Project")}else{s.setValueState(h.None);t.setProperty("/U_Project",i);t.setProperty("/U_ProjectCode",a)}console.log(t.getData())},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onApproveButtonClick:function(e){var t=this.getView().byId("budgetingPageId");var s=this.getView().getModel("viewModel");t.setBusy(true);var o=this.getView().byId("_IDGenText101").getText();$.ajax({type:"POST",data:{Code:o,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"budget/approveBudget",success:function(e,o,r){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Success",state:h.Success,content:new n({text:"Budget approved"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){s.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onRejectButtonClick:function(e){if(!this.rejectBudgetingDialog){this.rejectBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.budgeting.RejectForm"})}this.rejectBudgetingDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("budgetingPageId");var t=this.getView().getModel("budgetingDetailModel").getData();e.setBusy(true);var s=t.Code;var o=t.U_Company;var r=this.getView().byId("RejectionRemarksID").getValue();var l=this.getView().byId("rejectDialog");var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:s,Remarks:r,Company:o},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"budget/rejectBudget",success:function(t,s,o){l.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Success",state:h.Success,content:new n({text:"Budget rejected"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onAmountChange:function(e){const t=this.getView().getModel("budgetingDetailModel");var s=t.getData();var a=t.getData().BUDGETREQLINESCollection;let i=0;for(let e=0;e<a.length;e++){i+=Number(a[e]["U_Amount"])}t.setProperty("/U_TotalAmount",i);var o=s.BUDGETUSEDCollection;let n=0;if(o.length>0){for(let e=0;e<o.length;e++){n+=Number(o[e]["U_Amount"])}}t.setProperty("/U_TotalUsedBudget",Number(n));var r=Number(s.U_TotalAmount)-Number(n);t.setProperty("/U_RemainingBudget",Number(r))},onCompanyChange:function(e){this.getView().byId("CreatePillar").setSelectedKey("");this.getView().byId("CreateClassification").setSelectedKey("");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateClassification").setEnabled(false);this.getView().byId("CreateSubClassification").setEnabled(false);this.getView().byId("CreateSubClassification2").setEnabled(false);var t=e.getSource(),s=t.getSelectedKey(),a=t.getValue();if(!s&&a){t.setValueState(h.Error);t.setValueStateText("Please enter a valid Company");this.getView().byId("CreatePillar").setEnabled(false)}else{t.setValueState(h.None);var i=e.oSource.getSelectedItem().getBindingContext("companies").getPath();this.companyPath=i;var o=this.getView().byId("CreatePillar");o.setEnabled(true);o.bindAggregation("items",{path:"companies>"+i+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})})}},onPillarChange:function(e){var t=this.getView().getModel("budgetingDetailModel");this.getView().byId("CreateClassification").setSelectedKey("");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateSubClassification").setEnabled(false);this.getView().byId("CreateSubClassification2").setEnabled(false);var s=e.getSource(),a=s.getSelectedKey(),i=s.getValue();if(!a&&i){this.getView().byId("CreateClassification").setEnabled(false);s.setValueState(h.Error);s.setValueStateText("Please enter a valid Pillar")}else{s.setValueState(h.None);var o=e.oSource.getSelectedItem().getBindingContext("companies").getPath();t.setProperty("/U_Pillar",i);t.setProperty("/U_PillarCode",a);var n=this.getView().byId("CreateClassification");n.setEnabled(true);n.bindAggregation("items",{path:"companies>"+o+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})})}},onClassificationChange:function(e){var t=this.getView().getModel("budgetingDetailModel");this.getView().byId("CreateSubClassification").setSelectedKey("");this.getView().byId("CreateSubClassification2").setSelectedKey("");this.getView().byId("CreateSubClassification2").setEnabled(false);var s=e.getSource(),a=s.getSelectedKey(),i=s.getValue();if(!a&&i){this.getView().byId("CreateSubClassification").setEnabled(false);s.setValueState(h.Error);s.setValueStateText("Please enter a valid Classification")}else{s.setValueState(h.None);t.setProperty("/U_Classification",i);t.setProperty("/U_ClassificationCode",a);var o=e.oSource.getSelectedItem().getBindingContext("companies").getPath();var n=this.getView().byId("CreateSubClassification");n.setEnabled(true);n.bindAggregation("items",{path:"companies>"+o+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})})}},onSubClassificationChange:function(e){this.getView().byId("CreateSubClassification2").setSelectedKey("");var t=this.getView().getModel("budgetingDetailModel");var s=e.getSource(),a=s.getSelectedKey(),i=s.getValue();if(!a&&i){this.getView().byId("CreateSubClassification2").setEnabled(false);s.setValueState(h.Error);s.setValueStateText("Please enter a valid SubClassification")}else{s.setValueState(h.None);t.setProperty("/U_SubClass",i);t.setProperty("/U_SubClassCode",a);var o=e.oSource.getSelectedItem().getBindingContext("companies").getPath();var n=this.getView().byId("CreateSubClassification2");n.setEnabled(true);n.bindAggregation("items",{path:"companies>"+o+"/nodes",template:new sap.ui.core.Item({key:"{companies>code}",text:"{companies>text}"})})}},onSubClassification2Change:function(e){var t=this.getView().getModel("budgetingDetailModel");var s=e.getSource(),a=s.getSelectedKey(),i=s.getValue();if(!a&&i){s.setValueState(h.Error);s.setValueStateText("Please enter a valid SubClassification2")}else{s.setValueState(h.None);t.setProperty("/U_SubClass2",i);t.setProperty("/U_SubClass2Code",a)}},onAddPress:function(e){const t=this.getView().getModel("budgetingDetailModel");var s=t.getData();var a={U_AccountCode:"",U_Amount:""};s.BUDGETREQLINESCollection.push(a);var i=new sap.ui.model.json.JSONModel(s);this.getView().setModel(i,"budgetingDetailModel");i.refresh()},onSaveButtonClick:function(e){var t=this.getView().byId("budgetingPageId");var s=this.getView().getModel("budgetingDetailModel");var o=JSON.stringify(s.getData());var r=this.oJWT;$.ajax({type:"POST",data:o,headers:{Authorization:"Bearer "+r},crossDomain:true,url:backendUrl+"budget/saveBudget",contentType:"application/json",success:function(e,s,o){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Success",state:h.Success,content:new n({text:"Budget saved"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,o){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Error",state:h.Error,content:new n({text:"Can not create budget."+o}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}console.log("Got an error response: "+s+o)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("budgetingPageId");t.setBusy(true);var s=this.getView().getModel("budgetingDetailModel");var o=JSON.stringify(s.getData());var r=this.oJWT;$.ajax({type:"POST",data:o,headers:{Authorization:"Bearer "+r},crossDomain:true,url:backendUrl+"budget/resubmitBudget",contentType:"application/json",success:function(e,s,o){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Success",state:h.Success,content:new n({text:"Budget resubmitted"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onCancelButtonClick:function(e){var t=this.getView().byId("budgetingPageId");var s=this.getView().getModel("budgetingDetailModel");var o=s.getData();var r=this.oJWT;var l=this.company;c.warning("Cancel this Budget ?",{actions:[c.Action.OK,c.Action.CANCEL],emphasizedAction:c.Action.OK,onClose:function(e){if(e=="OK"){t.setBusy(true);$.ajax({type:"POST",data:{Code:o.Code,Company:l},headers:{Authorization:"Bearer "+r},crossDomain:true,url:backendUrl+"budget/cancelBudget",success:function(e,s,o){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Info",state:h.Information,content:new n({text:"Budget cancelled"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})}}})},onCloseButtonClick:function(e){var t=this.getView().byId("budgetingPageId");var s=this.getView().getModel("budgetingDetailModel");var o=s.getData();var r=this.oJWT;var l=this.company;c.warning("Close this Budget ?",{actions:[c.Action.OK,c.Action.CANCEL],emphasizedAction:c.Action.OK,onClose:function(e){if(e=="OK"){t.setBusy(true);$.ajax({type:"POST",data:{Code:o.Code,Company:l},headers:{Authorization:"Bearer "+r},crossDomain:true,url:backendUrl+"budget/closeBudget",success:function(e,s,o){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:d.Message,title:"Info",state:h.Information,content:new n({text:"Budget closed"}),beginButton:new i({type:u.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})}}})},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("budgetingDetailModel");var i=a.getData().BUDGETREQLINESCollection;i.splice(s,1);a.setProperty("/BUDGETREQLINESCollection",i);a.refresh();this.onAmountChange()},dateFormatter:function(e){var t=new Date(e);var s=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var a=s.format(t);return a},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else if(e==5){return"Closed"}else if(e==99){return"Cancelled"}else{return"Rejected"}}})});