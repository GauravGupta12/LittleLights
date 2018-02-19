export class User {
    displayName: string;
    uid: string;
    email: string;
    password: string;
    photoURL: string;
    createdAt: any;
    place: number;
    hobbies: string;
    littleNote: string;
    shortDescription: string;
    dbUsername: string;

    constructor( displayName: string,
    uid: string,
    email: string,
    createdAt: any,
    dbUsername: string,
    password ?: string,
    photoURL ?: string,
    place ?: number,
    hobbies ?: string,
    littleNote ?: string,
    shortDescription ?: string) {

        this.displayName = displayName;
        this.uid = uid;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.dbUsername = dbUsername;
        this.photoURL = photoURL;
        this.place = place;
        this.hobbies = hobbies;
        this.littleNote = littleNote;
        this.shortDescription = shortDescription;
    }
}
