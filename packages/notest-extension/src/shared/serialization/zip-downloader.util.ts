export class ZipDownloader {
    
    download(data:Uint8Array, filename = ""){
        const blob = new Blob([data], {type: "application/zip"});
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename
        });
    }
    
}
