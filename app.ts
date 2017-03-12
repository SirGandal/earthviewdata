// A photo as described by the JSON object used by the website
class Photo {
    id: string;
    slug: string;
	url: string;
	api: string;
	title: string;
	lat: number;
	lng: number;
	photoUrl: string;
	thumbUrl: string;
	downloadUrl: string;
	region: string;
	country: string;
	attribution: string;
	mapsLink: string;
	mapsTitle: string;
	nextUrl: string;
	nextApi: string;
	prevUrl: string;
	prevApi: string;
}

// A simpler version of a photo that contains the minimum amount of info for our purposes:
// * Creating a KML file with folders ordered as they are found when querying the site
// * Creating a KML file with folders ordered by country
// * Creating a KML file with folders ordered by amount of photos per country
class ReducedPhoto {
	country: string;
	region: string;
	lat: number;
	lng: number;
	title: string;

	constructor(country: string, region: string, lng: number, lat: number, title: string){
		this.country = country;
		this.region = region;
		this.lat = lat;
		this.lng = lng;

		// All titles have the the following suffix, we want to remove it since this is used as Placemark name
		var titleSuffix = " – Earth View from Google";
		if(title.indexOf(titleSuffix) !== -1){
			this.title = title.replace(titleSuffix,"");
		}else{
			this.title = title;
		}
	}
}

// A class that contains all the photos of a given country alongside the overall count
class CountryPhotos{
	count: number;
	photos: ReducedPhoto[];

	constructor(photo: ReducedPhoto){
		this.photos = [];
		this.photos.push(photo);
		this.count = 1;
	}

	addPhoto(photo: ReducedPhoto){
		if(!this.photos){
			return;
		}
		this.photos.push(photo);
		this.count++;
	}
}

var download = (text, name, type): void => {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

var get = (url: string) :string => {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",url,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

var getKmlFileString = (folders: string[]) => {
	return `<?xml version="1.0" encoding="UTF-8"?>
			<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
			<Folder>
				<name>Earth View With Google Places</name>
				<open>1</open>
				${folders.join("\n")}
			</Folder>
			</kml>`;
}

var getKmlFoldersFromPhotos = (photos: {[country: string]: CountryPhotos}) : string[] => {
	var folders: string[] = [];

	for (var countryName in photos) {
		if (photos.hasOwnProperty(countryName)) {
			var placemarkKmlNodes : string[] = [];

			photos[countryName].photos.forEach((photo: ReducedPhoto) => {
				placemarkKmlNodes.push(getPlacemarkKmlNode(photo.lat, photo.lng, photo.title));
			});

			folders.push(getKmlFolder(countryName, placemarkKmlNodes));
		}
	}

	return folders;
}

var getKmlFolder = (folderName: string, placemarks: string[]) =>{
	return `		<Folder>
				<name>(${placemarks.length}) ${folderName}</name>
				<open>0</open>
				${placemarks.join("\n")}
			</Folder>`;
};

var getPlacemarkKmlNode = (lat: number, lng: number, title: string) => {
	return `			<Placemark>
				<name>${title}</name>
				<Point>
					<coordinates>${lat},${lng},0</coordinates>
				</Point>
			</Placemark>`;
	
};

var baseUrl = `${window.location.protocol}//${window.location.hostname}`;
var photos: Photo[] = []
var nextImageElement = document.querySelector("[title=\"Next image\"]");
var nextImageApiEndpoint = nextImageElement.getAttribute("data-photo-api");
var fullUrl = `${baseUrl}${nextImageApiEndpoint}`;
var json_obj = JSON.parse(get(fullUrl));
var loop = true;
var addedIds = []

while(json_obj && loop) {
	var id = (<Photo>json_obj).id;
	if(addedIds.indexOf(id) === -1){
		addedIds.push(id);
		photos.push(json_obj);
		if(json_obj.nextApi){
			fullUrl = `${baseUrl}${json_obj.nextApi}`;
			json_obj = JSON.parse(get(fullUrl));
            json_obj.lat = Number(json_obj.lat);
            json_obj.lng = Number(json_obj.lng);
		}
	} else {
		// We have found a photo that is already existing in our local collection.
		// This means that we have looped back and we can stop looking forward.
		loop = false;
    }
}

// Download the JSON that represent all the photos found.
// This could be used later to run some analysis or access URLs to download wallpaper images.
download(`[${photos.map(function(o){return JSON.stringify(o);}).join(",")}]`, 'earthviewData.json', 'application/json');

// A "Dictionary" containing the country name as key and all the photos belonging to that country as value
var photosByCountry : { [country: string]: CountryPhotos; } = 
	photos
		.map(p => new ReducedPhoto(p.country, p.region, p.lat, p.lng, p.title))
		.reduce((previousPhoto, currentPhoto) => {
			var country = currentPhoto.country.trim();
			if (previousPhoto[country]) {
				(<CountryPhotos> previousPhoto[country]).addPhoto(currentPhoto);
        	} else {
				previousPhoto[country] = new CountryPhotos(currentPhoto);
    		}
        	return previousPhoto;
    	}, {});

// Order photos alphabetically by country name.
var sortedPhotosByCountry : { [country: string]: CountryPhotos; } = {};

// We first extract and order all the keys (the country name).
var countryNamesInAlphabeticalOrder = Object.keys(photosByCountry).sort();

// Then we create a separate dictionary by following the new order.
for (var i=0; i < countryNamesInAlphabeticalOrder.length; i++) {
    var key = countryNamesInAlphabeticalOrder[i];
    var value = photosByCountry[key];
	sortedPhotosByCountry[key] = value;
}

// Order photos by photos per country
var sortedPhotosByCount : { [country: string]: CountryPhotos; } = {};

// We first create a list of strings in the format "count||countryName".
var countTocountryNames : string[] = [];
for(var countryName in photosByCountry){
	if(photosByCountry.hasOwnProperty(countryName)){
		countTocountryNames.push(`${photosByCountry[countryName].count}||${countryName}`);
	}
}

// Then we order the "count||countryName" strings in decreasing order by looking at the count
// and then we map to a new list of strings containing the country names only.
// These gives us the list of country names ordered by photos count.
var sortedCountryNamesByCount = countTocountryNames.sort((countToCountryA, countToCountryB) => {
	var countA = Number(countToCountryA.split("||")[0]);
	var countB = Number(countToCountryB.split("||")[0]);
	
	return countA > countB ? -1 : 1;
}).map((countToCountry) => {
	return countToCountry.split("||")[1]
});

// Then we create a separate dictionary by following the new order.
for (var i=0; i < sortedCountryNamesByCount.length; i++) {
    var key = sortedCountryNamesByCount[i];
    var value = photosByCountry[key];
	sortedPhotosByCount[key] = value;
}

var kmlFileString = getKmlFileString(getKmlFoldersFromPhotos(photosByCountry));
download(kmlFileString, 'EarthViewWithGoogle.kml', 'application/vnd.google-earth.kml+xml');

kmlFileString = getKmlFileString(getKmlFoldersFromPhotos(sortedPhotosByCountry));
download(kmlFileString, 'EarthViewWithGoogle_ByName.kml', 'application/vnd.google-earth.kml+xml');

kmlFileString = getKmlFileString(getKmlFoldersFromPhotos(sortedPhotosByCount));
download(kmlFileString, 'EarthViewWithGoogle_ByCount.kml', 'application/vnd.google-earth.kml+xml');