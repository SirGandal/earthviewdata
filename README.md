# Earth View Data
A developer console script to extract and download data from https://earthview.withgoogle.com.

## The idea ##
### In a nutshell ###
The idea is to save images in 4K using [Google Earth Pro](https://www.google.com/earth/download/gep/agree.html) by using geo data extracted from Earth View photos.
 
### Why? ###
After a week of using the [Earth View from Google Earth](https://chrome.google.com/webstore/detail/earth-view-from-google-ea/bhloflhklmhfpedakmangadcdofhnnoh?hl=en) extension in Chrome I fell in love with the beautiful images that were shown every single time I opened a new tab.  
I then discovered that those images can be discovered from a website: https://earthview.withgoogle.com/.   
I was pleased to know that I could download those images to use as wallpaper, less so when I discovered that the resolution of the wallpapers was 1800x1200.  Since I use three monitors and the wallpaper expands all three of them I wanted something at a higher resolution.  

##About the script##
TODO  

## How to use ##

###Background###
Google Earth Pro is now available for free and one of its features is the possibility of downloading satellite images up to 4K.  In order to download the same images that we can see in Earth View into Google Earth Pro we need to know the locations they are linked to. To do so we can run a little script on the Earth View website that can allow us to get the latitude and longitude of the locations. We then package those information into a kml file that we can open into Google Earth Pro giving as the ability to have all the locations in one place and the ability to download the satelitte images in 4K.

###Steps###
 - On Google Chrome go to https://earthview.withgoogle.com/.
 - Open the Chrome Dev Tools.
 - Copy the content of app.js, paste it to the Console and press enter.
 - Script will start running and in less than a minute you should see 4 files (1 json and 3 kml files) being downloaded.
 - Open one of the KML files in Google Earth Pro. (Note that the only difference between the kml files is how the placemarks are ordered)
 - Double click on one of the placemarks on the list to go to a specific location.
 - Pan/Zoom/Rotate according to preference.
 - When what you are looking at is what you would like to save as image click on *File > Save > Save Image*.
 - Click on Map Options and toggle off all the options.
 - Click on Resolution and select "4K UHD" or "Maximum".
 - Click on Save Image.

##Some stats##
###Countries with most photos###

 1. United States - 313
 2. Australia - 88
 3. China - 80
 4. Mauritania - 67
 5. Spain - 57
 6. France - 50
 7. Germany - 36
 8. Libya - 35
 9. Argentina - 33
 10. Mexico - 32
