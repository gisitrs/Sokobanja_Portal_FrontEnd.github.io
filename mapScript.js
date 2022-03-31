//#region initialize objects

/* objects for specific classes*/ 

//const locations = new Locations();
const mapLabelsRS = new MapLabelsRS();
const mapLabelsENG = new MapLabelsENG();

const mapLayerLabelsRS = new MapLayerLabelsRS();
const mapLayerLabelsENG = new MapLayerLabelsENG();

const cityId = 1;
const cityCoords = [43.6433, 21.8667];
const apiUrladdress = new APIUrls();

/* enum class for language */
const appLanguages = Object.freeze({
    Serbian: 'Serbian',
    English: 'English'
});

/* variables for toggle menu visibility */

var layersMenuVisibility = false;
var mapLegendMenuVisibility = false;
var languagesVisibility = false;

/* current language variable */

var currentLanguage = appLanguages.Serbian;

/* variables for map and location div */

var mapDivPercentageHeight = '70%';
var locationsPanelPercentageHeight = '30%';
var isHiddenLocationPanel = false;
var locationsForCityArray = {};
var citiesArray = [];
var selectedCity = {};

/* location images */
var slideIndex = 0;

var imageURLsList = [];
var imageHeaderTextRS = [];
var imageHeaderTextENG = [];
var locationCoords = [];
var imageLocationTextRS = [];
var imageLocationTextENG = [];
var locationZoomLevels = [];
var locationIds = [];
var imagePositionsArray = [];

function prepareElementsForSlideShow(locationsPriorityOne){
    locationCoords = [];

    locationsPriorityOne.forEach((location) => (
        imageURLsList.push(location.image_url_location),
        imageHeaderTextRS.push(location.name),
        imageHeaderTextENG.push(location.name),
        imageLocationTextRS.push(location.name),
        imageLocationTextENG.push(location.name),
        locationCoords.push([parseFloat(location.x_coord), parseFloat(location.y_coord)]),
        locationZoomLevels.push(16),
        locationIds.push(location.location_id),
        imagePositionsArray.push(location.image_position)
        ));

        console.log(locationCoords);
}

//#endregion

//#region get data from api

// Defining async function

async function getLocationsAPI(url) {
    
    // Storing response
    const response = await fetch(url);
    
    // Storing data in form of JSON
    if (response){
        var data = await response.json();
        locationsForCityArray = new LocationsTest(data);
        prepareElementsForSlideShow(locationsForCityArray.getLocationsByPriority(1));
    }
}

async function getCitiesAPI(url) {
    
    // Storing response
    const response = await fetch(url);
    
    // Storing data in form of JSON
    if (response){
        var data = await response.json();
        citiesArray = new Cities(data);
        selectedCity = citiesArray.getCityById(1);
    }
}

//#endregion

//#region initialize map and wms layers

// initialize map
var map = L.map('map', { attributionControl: false, zoomControl:false }).setView(cityCoords, 15);

// initialize base layers

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 30,
      attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

osm.addTo(map);

// initialize wms layers (roads, locations and zones)

var wmsLayerRoads = L.tileLayer.wms('http://localhost:8080/geoserver/Sokobanja_portal/wms', {
    layers: "Sokobanja_portal:Putevi",
    format: "image/png",
    transparent: true,
    attribution: "mylayer",
  });

var wmsLayerZones = L.tileLayer.wms('http://localhost:8080/geoserver/Sokobanja_portal/wms', {
    layers: "Sokobanja_portal:Zone",
    format: "image/png",
    transparent: true,
    attribution: "mylayer",
});

/* async functions for loading WMS layers */

async function loadAndHideWMS(layerGroup, wMSLayer){
      await loadWMS(layerGroup, wMSLayer);
      layerGroup.clearLayers();
};

async function loadWMS(layerGroup, wMSLayer){
    layerGroup.addLayer(wMSLayer);
    return;
};

// add geocoder search
//L.Control.geocoder().addTo(map);

//#endregion

//#region create toggle menu

// toggle menu 

const ToggleMenu = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
      container.innerHTML = `<input type="checkbox" name="" id="check">
                             <div class="container">
                                <label for="check">
                                    <span class="fas fa-times" id="times" onclick="hidePanels()"></span>
                                    <span class="fas fa-bars" id="bars"></span>
                                </label>
                                <div class="head"><i class="fas fa-bars" style="padding-left:8px;"></i></div>
                                <div class="toggleMenu">
                                    <li>
                                       <button id="layerGroupButton" class="buttonClass" title="Prikaži slojeve!" onclick="showLayersPanel()">
                                          <i class="fas fa-layer-group"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button id="legendMapButton" title="Prikaži legendu!" class="buttonClass" onclick="showMapLegendPanel()">
                                            <i class="fas fa-map"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button id="infoPageButtonId" title="Idi na Info stranu!" class="buttonClass" onclick="goToInfoPage()">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button id="primeLocationButtonId" title="Vrati na početnu lokaciju!" class="buttonClass" onclick="goToPrimaryLocation()">
                                            <i class="fas fa-map-marked-alt"></i>
                                        </button>
                                    </li>
                                    <li>
                                        <button id="languagesButtonId" title="Izaberi jezik!" class="buttonClass" onclick="showLanguagesPanel()">
                                            <i class="fas fa-language"></i> 
                                        </button>
                                    </li>
                                </div>
                            </div>`; 
  return container;
    }
});

map.addControl(new ToggleMenu({ position: "topleft" }));

function goToInfoPage(){
    var url = "Info.html?language=" + currentLanguage + "&cityId=" + cityId;
    window.location.href= url;
}

/* Toggle menu functions */

function showLayersPanel() {
    showHidePanels('mapLegendContainer', 'languagesContainer', 'layersContainer', layersMenuVisibility);
}

function showMapLegendPanel() {
    showHidePanels('layersContainer', 'languagesContainer', 'mapLegendContainer', mapLegendMenuVisibility);
}

function showLanguagesPanel() {
    showHidePanels('layersContainer', 'mapLegendContainer', 'languagesContainer', languagesVisibility);
}

function showHidePanels(containerToHide, containerToHide1, containerToShow, visibleVariableValue){
    document.getElementsByClassName(containerToHide)[0].style.visibility = 'hidden';
    setVisibilityVariable(containerToHide, false);

    document.getElementsByClassName(containerToHide1)[0].style.visibility = 'hidden';
    setVisibilityVariable(containerToHide1, false);

    if (visibleVariableValue == false){
        showHidePanel(containerToShow, 'visible');
        setVisibilityVariable(containerToShow, true);
    }
    else if (visibleVariableValue == true){
        showHidePanel(containerToShow, 'hidden');
        setVisibilityVariable(containerToShow, false);
    }
}

function setVisibilityVariable(containerType, visibility){
    if (containerType == "mapLegendContainer"){
        mapLegendMenuVisibility = visibility;
    }
    else if (containerType == "layersContainer"){
        layersMenuVisibility = visibility;
    }
    else if (containerType == "languagesContainer"){
        languagesVisibility = visibility;
    }
}

function hidePanels(){
    if (layersMenuVisibility == true){
        showHidePanel('layersContainer', 'hidden');
        layersMenuVisibility = false;
    }
    else if (mapLegendMenuVisibility == true){
        showHidePanel('mapLegendContainer', 'hidden');
        mapLegendMenuVisibility = false;
    }
    else if (languagesVisibility == true){
        showHidePanel('languagesContainer', 'hidden');
        languagesVisibility = false;
    }
}

function showHidePanel(className, visibility){
    document.getElementsByClassName(className)[0].style.visibility = visibility;
}

//#endregion

//#region translate all labels

/* function for translate on specific language */

function translateOnSerbian(){
    currentLanguage = appLanguages.Serbian;
    translateOnLanguage(mapLabelsRS, mapLayerLabelsRS);
}

function translateOnEnglish(){
    currentLanguage = appLanguages.English;
    translateOnLanguage(mapLabelsENG, mapLayerLabelsENG);
}

function translateOnLanguage(labels, mapLayerLabels){
    translateMapLayerLabels(mapLayerLabels);
    translateMapButtonLabels(labels);
    
    translateLocationsPanelButton();
    translateLocationHeaders();
}

function translateMapLayerLabels(mapLayerLabels){
    document.getElementById("cityLocationsLB").innerHTML = mapLayerLabels.CityLocations;
    document.getElementById("picnicAreasLB").innerHTML = mapLayerLabels.PicnicAreas;
    document.getElementById("waterSpringsLB").innerHTML = mapLayerLabels.WaterSprings;
    document.getElementById("culturalContentLB").innerHTML = mapLayerLabels.CulturalContent;
    document.getElementById("bathsLB").innerHTML = mapLayerLabels.Baths;
    document.getElementById("parksLB").innerHTML = mapLayerLabels.Parks;
    document.getElementById("naturalAttractionsLB").innerHTML = mapLayerLabels.NaturalAttractions;
    document.getElementById("childrenFacilitiesLB").innerHTML = mapLayerLabels.ChildrenFacilities;
    document.getElementById("sportsFacilitiesLB").innerHTML = mapLayerLabels.SportsFacilities;
    document.getElementById("thermalSpringsLB").innerHTML = mapLayerLabels.ThermalSprings; 
    document.getElementById("touristSitesLB").innerHTML = mapLayerLabels.TouristSides;
    document.getElementById("lookoutsLB").innerHTML = mapLayerLabels.Lookouts;
    document.getElementById("sightsLB").innerHTML = mapLayerLabels.Sights;
    document.getElementById("zonesLB").innerHTML = mapLayerLabels.Zones;
    document.getElementById("roadsLB").innerHTML = mapLayerLabels.Roads;
}

function translateMapButtonLabels(labels){
    document.getElementById("layerGroupButton").title = labels.LayerGroupButtonTitle;
    document.getElementById("legendMapButton").title = labels.LegendMapButtonTitle;
    document.getElementById("infoPageButtonId").title = labels.InfoPageButtonTitle;
    document.getElementById("primeLocationButtonId").title = labels.PrimeLocationButtonTitle;
    document.getElementById("serbianLanguageButtonId").title = labels.SerbianLanguageButtonTitle;
    document.getElementById("englishLanguageButtonId").title = labels.EnglishLanguageButtonTitle;
    document.getElementById("languagesButtonId").title = labels.LanguagesButtonTitle;
}

function translateLocationsPanelButton(){
    if (currentLanguage == appLanguages.Serbian){
        var currentMapLabels = mapLabelsRS;
    }
    else if (currentLanguage == appLanguages.English){
        var currentMapLabels = mapLabelsENG;
    }

    var imageUrl = document.getElementById("locationsButtonId").style.backgroundImage;

    if (imageUrl == 'url("./images/fullscreen.png")'){
        document.getElementById("locationsButtonId").title = currentMapLabels.FullScreenPreview;
    }
    else {
        document.getElementById("locationsButtonId").title = currentMapLabels.ExitFullScreenPreview;
    }
}

function translateLocationHeaders(){
    if (currentLanguage == appLanguages.Serbian){
        var currentImageHeaders = imageHeaderTextRS;
        var currentImageDescriptionText = imageLocationTextRS;
    }
    else if (currentLanguage == appLanguages.English){
        var currentImageHeaders = imageHeaderTextENG;
        var currentImageDescriptionText = imageLocationTextENG;
    }

    document.getElementById('locationImageHeader').innerHTML = currentImageHeaders[slideIndex];
    document.getElementById('locationImageText').innerHTML = currentImageDescriptionText[slideIndex];
}

//#endregion

//#region layers panel and zoom to location functions

// zoom to location

function goToPrimaryLocation(){
	// zoomToLocation(cityCoords, 15);
    map.setView(cityCoords, 15);
}

function zoomToLocation(zoomValue, locationId){
    var locationName = locationsForCityArray.getLocationNameByLocationId(locationId);
    var locationImageURL = locationsForCityArray.getLocationImageURLByLocationId(locationId);
    var locationXCoord = locationsForCityArray.getLocationXCoordByLocationId(locationId);
    var locationYCoord = locationsForCityArray.getLocationYCoordByLocationId(locationId);
    var locationTypeId = locationsForCityArray.getLocationTypeIdByLocationId(locationId);

    CreateMarker([locationXCoord, locationYCoord], locationName, priorityOneLocationsLayerGroup, 
        markerIconsArray[locationTypeId - 1], locationImageURL);

	map.setView([locationXCoord + 0.0012, locationYCoord], zoomValue);
}

/* layers panel */

const LayersPanel = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
      container.innerHTML = `<div class="layersContainer" style="OVERFLOW-Y:scroll;">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="cityLocationsCB" onclick="showHideMarkersforLocationType(1, cityLocationsCB)">
                                    <label class="form-check-label" for="cityLocationsCB" id="cityLocationsLB">
                                        Gradske lokacije
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="picnicAreasCB" onclick="showHideMarkersforLocationType(2, picnicAreasCB)">
                                    <label class="form-check-label" for="picnicAreasCB" id="picnicAreasLB">
                                        Izletišta
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="waterSpringsCB" onclick="showHideMarkersforLocationType(3, waterSpringsCB)">
                                    <label class="form-check-label" for="waterSpringsCB" id="waterSpringsLB">
                                        Izvorišta
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="culturalContentCB" onclick="showHideMarkersforLocationType(4, culturalContentCB)">
                                    <label class="form-check-label" for="culturalContentCB" id="culturalContentLB">
                                        Kulturni sadržaji
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="bathsCB" onclick="showHideMarkersforLocationType(5, bathsCB)">
                                    <label class="form-check-label" for="bathsCB" id="bathsLB">
                                        Kupališta
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="parksCB" onclick="showHideMarkersforLocationType(6, parksCB)">
                                    <label class="form-check-label" for="parksCB" id="parksLB">
                                        Parkovi
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="naturalAttractionsCB" onclick="showHideMarkersforLocationType(7, naturalAttractionsCB)">
                                    <label class="form-check-label" for="naturalAttractionsCB" id="naturalAttractionsLB">
                                        Prirodne atrakcije
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="childrenFacilitiesCB" onclick="showHideMarkersforLocationType(8, childrenFacilitiesCB)">
                                    <label class="form-check-label" for="childrenFacilitiesCB" id="childrenFacilitiesLB">
                                        Sadržaji za decu
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="sportsFacilitiesCB" onclick="showHideMarkersforLocationType(9, sportsFacilitiesCB)">
                                    <label class="form-check-label" for="sportsFacilitiesCB" id="sportsFacilitiesLB">
                                        Sportski sadržaji
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="thermalSpringsCB" onclick="showHideMarkersforLocationType(10, thermalSpringsCB)">
                                    <label class="form-check-label" for="thermalSpringsCB" id="thermalSpringsLB">
                                        Termalna izvorišta
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="touristSitesCB" onclick="showHideMarkersforLocationType(11, touristSitesCB)">
                                    <label class="form-check-label" for="touristSitesCB" id="touristSitesLB">
                                        Turističke pogod
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="lookoutsCB" onclick="showHideMarkersforLocationType(12, lookoutsCB)">
                                    <label class="form-check-label" for="lookoutsCB" id="lookoutsLB">
                                        Vidikovci
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="sightsCB" onclick="showHideMarkersforLocationType(13, sightsCB)">
                                    <label class="form-check-label" for="sightsCB" id="sightsLB">
                                        Znamenitosti
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="zonesCB" onclick="showHideZones()">
                                    <label class="form-check-label" for="sightsCB" id="zonesLB">
                                        Zone
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="roadsCB" onclick="showHideRoads()">
                                    <label class="form-check-label" for="sightsCB" id="roadsLB">
                                        Putevi
                                    </label>
                                </div>
                            </div>`; 
  return container;
    }
});

map.addControl(new LayersPanel({ position: "topleft" }));

const MapLegendPanel = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
      container.innerHTML = `<div class="mapLegendContainer" style="margin-top:45px;">
                                <img id="mapLegendId" src="./images/SmallLegend.jpg" alt="Map legend"></img>
                            </div>`; 
  return container;
    }
});

map.addControl(new MapLegendPanel({ position: "topleft" }));

//#endregion

//#region languages panel 
/* languages panel */

const LanguagesPanel = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
      container.innerHTML = `<div class="languagesContainer">
                                <button id="serbianLanguageButtonId" title="Prevedi na srpski jezik!" class="buttonClass" style="border: none;" onclick="translateOnSerbian()">
                                    <img src="./images/Serbia-Flag-icon.png" alt="" class="image-flag" style="margin-top: 9px;"></img> 
                                </button>
                                <button id="englishLanguageButtonId" title="Prevedi na engleski jezik!" class="buttonClass" style="border: none;" onclick="translateOnEnglish()">
                                    <img src="./images/GBR-flag-icon.png" alt="" class="image-flag" style="margin-top: 9px;"></img>
                                </button>
                            </div>`; 
  return container;
    }
});

map.addControl(new LanguagesPanel({ position: "topleft" }));

//#endregion

//#region page layout functions and button for show-hide locations

/* button for show-hide panel with locations */

// showing button for show/hide panel 
const Coordinates = L.Control.extend({
    onAdd: map => {
      const container = L.DomUtil.create("div");
      /*map.addEventListener("mousemove", e => {
          container.innerHTML = `<h2>Latitude is ${e.latlng.lat.toFixed(4)} <br> and Longitude is  ${e.latlng.lng.toFixed(4)} </h2>`;
         });*/
      container.innerHTML = `<div>
                                <button id="locationsButtonId" 
                                        type="button"
                                        title="Prikaži pun ekran!" 
                                        class="showHideLocations" 
                                        onclick="showHideLocations()" 
                                        style="background: url('./images/fullscreen.png') no-repeat;">
                                </button>`;
    return container;
    }
});

map.addControl(new Coordinates({ position: "bottomright" }));

/* page layout functions */

// set even listener for resizing page elements and map legend image
window.addEventListener('resize', changePageLayout);

function changePageLayout(){
    changeMapLegendImage();
    changePageLayout();
}

/* change image for map legend based on window width and height */

function changeMapLegendImage(){
    if ($(document).height() <= 600 || $(document).width() <= 500){
        document.getElementById("mapLegendId").src = "./images/SmallLegend.jpg";
    }
    else if ($(document).height() > 600 || $(document).width() > 500){
        document.getElementById("mapLegendId").src = "./images/LegendaSlika.jpg";
    }
}

/* change page layout for the map and locations */

function changePageLayout(){
    if (($(document).height() <= 600 || $(document).width() <= 500) && isHiddenLocationPanel == false){
        resizeDivElements(mapDivPercentageHeight, '100%', locationsPanelPercentageHeight, '100%', 'top', mapDivPercentageHeight);
        layout = 'vertical';
    } 
    else if (($(document).height() <= 600 || $(document).width() <= 500) && isHiddenLocationPanel == true){
        resizeDivElements('100%', '100%', '0%', '0%', 'none', '0%');
        layout = 'vertical';
    }
    else if (($(document).height() > 600 || $(document).width() > 500) && isHiddenLocationPanel == false){
        resizeDivElements('100%', mapDivPercentageHeight, '100%', locationsPanelPercentageHeight, 'right', mapDivPercentageHeight);
        layout = 'horizontal';
    }
    else if (($(document).height() > 600 || $(document).width() > 500) && isHiddenLocationPanel == true){
        resizeDivElements('100%', '100%', '0%', '0%', 'none', '0%');
        layout = 'horizontal';
    }

    map._onResize(); 
}

/* hide or show location panel */

function showHideLocations(){
    if (isHiddenLocationPanel == false){
        resizeDivElements('100%', '100%', '0%', '0%', 'none', '0%');
        document.getElementById("locationsButtonId").style.backgroundImage = "url('./images/Exit-full-screen.png')";
        document.getElementById("locationPanel").style.visibility='hidden';
        translateLocationsPanelButton();
        isHiddenLocationPanel = true;
    }
    else {
        isHiddenLocationPanel = false;
        document.getElementById("locationsButtonId").style.backgroundImage = "url('./images/fullscreen.png')";
        document.getElementById("locationPanel").style.visibility='visible';
        translateLocationsPanelButton();
        changePageLayout();
    }

    map._onResize(); 
}

/* function for resize map and location div */ 

function resizeDivElements(mapHeight, mapWidth, panelHeight, panelWidth, marginType, marginValue){
    var mapDiv = document.getElementById('map');
    var locationPanel = document.getElementById('locationPanel');

    mapDiv.style.height = mapHeight;
    mapDiv.style.width = mapWidth;
    locationPanel.style.height = panelHeight;
    locationPanel.style.width = panelWidth;

    if(marginType == 'top'){
        locationPanel.style.right = '0%';
        locationPanel.style.top= marginValue;
    }
    else if (marginType == 'right'){
        locationPanel.style.right = '0%';
        locationPanel.style.top= '0%';
    }
}

/* panel with locations - slide show -*/

startSlideShow();

function startSlideShow(){
    setTimeout(automaticPlusSlide, 7000);
}

function plusSlides() {
    slideIndex = slideIndex + 1;
    showSlides(false);
}

function minusSlides() {
    slideIndex = slideIndex - 1;
    showSlides(false);
  }

function automaticPlusSlide(){
    slideIndex = slideIndex + 1;
    showSlides(true);
}

function showSlides(isAutomatic) {
    var imageListCount = imageURLsList.length;
    var b = slideIndex;

    if (slideIndex == -1){
        slideIndex = imageListCount - 1;
    }
    else if (slideIndex == imageListCount){
        slideIndex = 0;
    } 

    $("#locationImage").attr("src",imageURLsList[slideIndex]);
    $("#locationImage").css("object-position",imagePositionsArray[slideIndex]);
    document.getElementById('locationIdText').innerHTML = locationIds[slideIndex];
    translateLocationHeaders();
    //document.getElementById('locationImageHeader').innerHTML = imageHeaderText[slideIndex];

    if (isAutomatic == true){
        startSlideShow();
    }
}

//#endregion

//#region functions for show-hide layers

/* create layer groups for or layers */ 

var cityLocationsGroup = L.layerGroup().addTo(map);
var picnicAreasGroup = L.layerGroup().addTo(map);
var waterSpringsGroup = L.layerGroup().addTo(map);
var culturalContentsGroup = L.layerGroup().addTo(map);
var bathsGroup = L.layerGroup().addTo(map);
var parksGroup = L.layerGroup().addTo(map);
var naturalAttractionsGroup = L.layerGroup().addTo(map);
var childrenFacilitiesGroup = L.layerGroup().addTo(map);
var sportsFacilitiesGroup = L.layerGroup().addTo(map);
var thermalSpringsGroup = L.layerGroup().addTo(map);
var touristSitesGroup = L.layerGroup().addTo(map);
var lookoutsGroup = L.layerGroup().addTo(map);
var sightsGroup = L.layerGroup().addTo(map);
var priorityOneLocationsLayerGroup = L.layerGroup().addTo(map);

var locationTypesLayerGroupsArray = [cityLocationsGroup, picnicAreasGroup, waterSpringsGroup,
                                     culturalContentsGroup, bathsGroup, parksGroup,
                                     naturalAttractionsGroup, childrenFacilitiesGroup, sportsFacilitiesGroup,
                                     touristSitesGroup, thermalSpringsGroup, lookoutsGroup, 
                                     sightsGroup]

var zonesGroup = L.layerGroup().addTo(map);
var roadsGroup = L.layerGroup().addTo(map);

/* functions for layer locations */

function showHideMarkersforLocationType(locationTypeId, elementId){
    if (document.getElementById(elementId.id).checked == true){
        prepareMarkerElements(locationTypeId);
    }
    else { 
        locationTypesLayerGroupsArray[locationTypeId - 1].clearLayers();
    }
}

function showHideZones(){
    if (document.getElementById("zonesCB").checked == true){
        zonesGroup.addLayer(wmsLayerZones);
    }
    else { 
        zonesGroup.clearLayers();
    }
}

function showHideRoads(){
    if (document.getElementById("roadsCB").checked == true){
        roadsGroup.addLayer(wmsLayerRoads);
    }
    else { 
        roadsGroup.clearLayers();
    }
}

function prepareMarkerElements(locationTypeId){
    var locationsForLocationTypeId = locationsForCityArray.getLocationsByTypeId(locationTypeId);
    for (const location of locationsForLocationTypeId) {
        CreateMarker([parseFloat(location.x_coord), parseFloat(location.y_coord)], location.name, 
                     locationTypesLayerGroupsArray[locationTypeId - 1], markerIconsArray[locationTypeId - 1],
                     location.image_url_location);
    }
}

/* initialize variables for icons for map markers */

var cityLocationsIcon = L.icon({
    iconUrl: './images/Markers/CityLocations.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var picnicAreasIcon = L.icon({
    iconUrl: './images/Markers/PicnicAreas.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var waterSpringsIcon = L.icon({
    iconUrl: './images/Markers/WaterSprings.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var culturalContentIcon = L.icon({
    iconUrl: './images/Markers/CulturalContent.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var bathsIcon = L.icon({
    iconUrl: './images/Markers/Baths.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var parksIcon = L.icon({
    iconUrl: './images/Markers/Parks.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var naturalAttractionsIcon = L.icon({
    iconUrl: './images/Markers/NaturalAttractions.png',
    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var childrenFacilitiesIcon = L.icon({
    iconUrl: './images/Markers/ChildrenFacilities.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var sportsFacilitiesIcon = L.icon({
    iconUrl: './images/Markers/SportsFacilities.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var thermalSpringsIcon = L.icon({
    iconUrl: './images/Markers/ThermalSprings.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var touristSitesIcon = L.icon({
    iconUrl: './images/Markers/CityLocations.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var lookoutsIcon = L.icon({
    iconUrl: './images/Markers/Lookouts.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var sightsIcon = L.icon({
    iconUrl: './images/Markers/Sights.png',

    iconSize:     [32, 37], // size of the icon
    iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
});

var markerIconsArray = [cityLocationsIcon, picnicAreasIcon, waterSpringsIcon,
                        culturalContentIcon, bathsIcon, parksIcon, 
                        naturalAttractionsIcon, childrenFacilitiesIcon, sportsFacilitiesIcon,
                        thermalSpringsIcon, touristSitesIcon, lookoutsIcon,
                        sightsIcon]

/* create marker function */ 

function CreateMarker(coords, markerName, locationsGroup, markerIcon, imageUrlLocation){

    marker = L.marker(coords, {
      title: markerName,
      icon: markerIcon
    }).addTo(map);

    marker.bindPopup('<b style="font-size:20px">' + markerName +'</b>' + 
                     '</br>' +
                     '</br>' +
                     '<div>' + 
                        '<img style="width:100%" src="' + imageUrlLocation + '" alt="images"></img>' + 
                        '<a href="Info.html">info</a>' +
                    '</div>',
    {minWidth:250});

    locationsGroup.addLayer(marker);

    if (locationsGroup == priorityOneLocationsLayerGroup){
        marker.openPopup();
    }
}

function createSimpleMarket(xCoord, yCoord){
    var marker = L.marker([xCoord, yCoord]).addTo(map);
}

//#endregion

//#region get current location (test code)

/** GET CURRENT LOCATION **/

/*var map = L.map('map').fitWorld();

var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    var locationMarker = L.marker(e.latlng).addTo(map)
        .bindPopup('You are within ' + radius + ' meters from this point').openPopup();

    var locationCircle = L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});*/

/* TABS MENU JS CODE */

/*const tabcontents = document.querySelectorAll(".tabcontent");
const tabLinks = document.querySelectorAll(".tabs a");

function openTab(event, tabName){*/
    /* REMOVE ALL TABCONTENTS */
    //tabcontents.forEach((tabcontent) => (tabcontent.style.display = "none"));
    
    /* REMOVE TABLINKS ACTIVE CLASSES */
    //tabLinks.forEach((tabLink) => tabLink.classList.remove("active"));

    /* ADD ACTIVE CLASS ON TABLINK AND OPEN IT */
    //event.currentTarget.classList.add("active");
    //document.getElementById(tabName).style.display = "block";
//}

//#endregion