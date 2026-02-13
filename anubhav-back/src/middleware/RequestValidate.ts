import { plainToInstance } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import { NextFunction, Request } from "express"


const extractErrorRecursively = (error: ValidationError, rawError: string[]) => {
    if (error.constraints) {
        Object.values(error.constraints).forEach((constraint) => {
            rawError.push(constraint)
        })
    }
    if (error.children && error.children.length > 0) {
        error.children.forEach((child) => {
            extractErrorRecursively(child, rawError)
        })
    }
}

const requestValidator = (requestType: any) => {
    return async (req: Request, res: any, next: NextFunction) => {
        const converterObject: any = plainToInstance(requestType, req.body)
        const valid = await validate(converterObject)
        if (valid.length > 0) {
            const rawErrors: string[] = []
            valid.forEach((validationError) => {
                extractErrorRecursively(validationError, rawErrors)
            });
            const data = { code: 400, data: rawErrors }
            res.status(400).json(data)
        } else {
            next()
        }
    }
}

export default requestValidator