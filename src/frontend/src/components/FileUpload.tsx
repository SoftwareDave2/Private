import {writeFile} from "node:fs/promises"
import {join} from "path"

export default function ServerUploadPage(){

    async function upload(data: FormData){
        'use server'
        const file: File | null = data.get('file') as unknown as File
        if(!file){
            throw new Error('no File uploaded')
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const path = join(process.cwd(),'/public','/uploads/',  file.name)
        await writeFile(path, buffer)
        console.log('open '+path + ' to see the uploaded file')
        //return{success: true}


    }
    return(
        <main>
            <div className="relative h-32 w-32">


                <h1>Upload a picture</h1>
                <form action={upload}>
                    <input type="file" id="file" name="file" className="text-sm  p-2 mr-2  mb-4"
                           accept="image/png, image/jpeg" multiple required/>
                    <br></br>
                    <div className="absolute bottom-0 right-0 h-16 w-16">
                        <button type="submit"
                                className=" mb-4 mt-4 bg-blue-500 text-white px-4 py-2 rounded">Upload
                        </button>
                    </div>

                </form>
            </div>
        </main>
)


}