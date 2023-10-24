import { diskStorage, StorageEngine } from "multer";
import { ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";

interface IFileStorageConfig {
    storage: StorageEngine;
}

export const fileStorageConfigObj: IFileStorageConfig = {
    storage: diskStorage({
        destination: "storage/post-images/",
        filename: (_, file, cb) => {
            const extension = file?.originalname?.split('.')?.[1] ?? "jpg";
            cb(null, `${Date.now()}.${extension}`);
        },
    })
};

export const parseFilePipeObj = new ParseFilePipe({
    fileIsRequired: false,
    validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        new FileTypeValidator({ fileType: ".(jpg|jpeg|png)" }),
    ],
});
