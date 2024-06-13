import { Client, Account, ID, Avatars, Databases, Storage, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.personal.react_native',
    projectId: '66331367003b197a552c',
    databaseId: '663315650038ffa91f6b',
    userCollectionId: '663316160005c9c607f4',
    videoCollectionId: '6633164f0036b07423c1',
    storageId: '66331855003760d0f188'
}


// Init your react-native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)

const account = new Account(client);
const storage = new Storage(client)
const avatars = new Avatars(client);
const databases = new Databases(client);


// Create a new user account

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const signIn = async (email, password) => {
    try {
        // await signOut()

        const session = await account.createEmailSession(email, password)

        return session;
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const signOut = async () => {
    try {

        const session = await account.deleteSessions('current');

        return session;
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0]
    } catch (error) {
        console.log(error)
    }
}

export async function getLatestPosts() {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.search("title", query)]
        );

        if (!posts) throw new Error("Something went wrong");

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal("creator", userId)]
        );

        if (!posts) throw new Error("Something went wrong");

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if(type === 'video'){
            fileUrl = storage.getFileView(config.storageId, fileId)
        } else if(type === 'image'){
            fileUrl = storage.getFilePreview(config.storageId, fileId, 2000, 2000, 'top', 100)
        } else {
            throw new Error('Invalid File Type')
        }

        if(!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        throw new Error(error)

    }
}

// export const uploadFile = async (file, type) => {
//     if(!file) return ;
//         console.log('FILE', file)

//     // const asset = {
//     //     name: file.fileName,
//     //     type: file.mimeType,
//     //     size: file.fileSize,
//     //     uri: file.uri
//     // }

//     const { mimeType, ...rest } = file;
//     const asset = { type: mimeType, ...rest };

//     try {
//         const uploadedFile = await storage.createFile(
//             config.storageId,
//             ID.unique(),
//             asset
//         );


//         const fileUrl = await getFilePreview(uploadedFile.$id, type);

//         return fileUrl;

//     } catch (error) {
//         throw new Error(error)
//     }

// }

export async function uploadFile(file, type) {
    if (!file) return;
  
    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };
  
    try {
      const uploadedFile = await storage.createFile(
        config.storageId,
        ID.unique(),
        asset
      );

      const fileUrl = await getFilePreview(uploadedFile.$id, type);
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
  }

export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video'),
        ])

        const newPost = await databases.createDocument(
            config.databaseId,
            config.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId
            }
        )
        console.log('form', form)
        return newPost;
    } catch (error) {
        throw new Error(error)
    }
}