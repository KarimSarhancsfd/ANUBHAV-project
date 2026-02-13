import { BadRequestException } from "@nestjs/common"
import { diskStorage } from "multer"

export const multerCofig = {
    storage: diskStorage({
        destination: './images',
        filename(req, file, cb) {
            const prefix = `${Date.now()}-${Math.round(Math.random() * 100000)}`
            const fileName = `${prefix}-${file.originalname}`
            cb(null, fileName)
        },
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new BadRequestException('must uploaded image'), false)
        }
    },
    limits: { fieldSize: 1024 * 1024 * 2 }
}