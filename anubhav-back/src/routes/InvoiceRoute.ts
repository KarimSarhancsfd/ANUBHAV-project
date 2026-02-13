import { Router } from "express";
import InvoicesController from "../controller/InvoicesController";
import requestValidator from "../middleware/RequestValidate";
import { addInvoiceRequest } from "../request/InvoiceRequest";



const router = Router() ; 

router.get("/" , InvoicesController.getInvoices) ; 
router.get("/:id" , InvoicesController.getInvoicesById) ; 
router.post("/" , requestValidator(addInvoiceRequest) , InvoicesController.addInvoice);
router.put("/:id" , requestValidator(addInvoiceRequest) , InvoicesController.updateInvoice) ; 
router.delete("/:id" , InvoicesController.deleteInvoice) ; 


export default router  ; 