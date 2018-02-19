export class Upload {
    key: string;
    file: File;
    url: string;
    name: string;
    progress: number;
    imageUID: string;
    videoUID: string;
    postUID: string;
    createdOn: Date = new Date();

    constructor(file: File) {
        this.file = file;
    }
}
