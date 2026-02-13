
import { Request, Response } from "express"
import { AppDataSource } from "../Config/dbConfig"
import { Invoices } from "../entity/InvoicesEntity"



export default class InvoicesController{
  
    public static addInvoice = async(
        req:Request , 
        res:Response
    ):Promise<void> =>{
        try{
            const invoiceRepo = AppDataSource.getRepository(Invoices)


            const newInvoice = invoiceRepo.create({
                groupId: req.body.groupId ,
                instructorId: req.body.instructorId , 
                topicId: req.body.topicId , 
                lecNum: req.body.lecNum , 
                rate: req.body.rate , 
                hoursNum: req.body.hoursNum , 
                totalCash: req.body.totalCash , 
            })
            await invoiceRepo.save(newInvoice) ; 
            res.status(200).json(newInvoice)
        }catch(error){
            res.status(500).json({message:`${error}`})
        }
    } ; 

    
    public static getInvoices = async(req:Request ,res:Response):Promise<void>=>{
        try{
         const invoiceRepo = AppDataSource.getRepository(Invoices)


            const invoice = await invoiceRepo.find() 
           res.status(200).json(invoice ) 
        }catch(error){
            res.status(500).json({message:`${error}`})        
        }
    } ;

    public static getInvoicesById = async(req:Request ,res:Response):Promise<void>=>{
        try{
            const invoiceRepo = AppDataSource.getRepository(Invoices)


            const invoice = await invoiceRepo.findOneBy({id:+(req.params.id)})
            
            if(invoice)   res.status(200).json(invoice ) 
            else    res.status(404).json({message:"Invoice not found"}) 
            
        }catch(error){
            res.status(500).json({message:`${error}`})        
        }
    } ; 

     
    
     
    public static updateInvoice = async(
        req:Request , 
        res:Response
    ):Promise<void> =>{
        try{
            const invoiceRepo = AppDataSource.getRepository(Invoices)


            const invoice = await invoiceRepo.findOne({where:{id: +(req.params.id)}})
                if(!invoice){
                    res.status(404).json({message:"Invoice not found"}) 
                    return 
                } else {
                    invoiceRepo.merge(invoice , req.body) ;
                    const result = await invoiceRepo.save(invoice) ;
                    res.send(result) 
                    res.status(200).json({ message:"Invoice updated successfully"});
                }
        }catch(error){
            res.status(500).json({message:`${error}`})
        }
    } ; 

    public static deleteInvoice = async(
        req:Request , 
        res:Response
    ): Promise<void>=> {
        try{
            const invoiceRepo = AppDataSource.getRepository(Invoices)


            const id  = +(req.params.id)
            const invoice = await invoiceRepo.findOneBy({id})
            if(!invoice) {
                res.status(404).json({message:"Invoice not found"}) ; 
                return 
            } else {
                await invoiceRepo.delete(id) ; 
                res.status(200).json({message:"Invoice deleted successfully"})
            }

        }catch(error){
            res.status(500).json({message:`${error}`}) ; 
        }
    } ;





}