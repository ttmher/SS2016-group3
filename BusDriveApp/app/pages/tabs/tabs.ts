import {Page, Alert, NavController, NavParams} from 'ionic-angular';
import {HomePage} from '../home/home';
import {DrivePage} from '../drive/drive';
import {MapPage} from '../map/map';
import {StopsPage} from '../stops/stops';
import {Geolocation} from 'ionic-native';
import {Lists} from '../../Services/lists';
import {language} from "../../languages/languages";

/*
 Created by ttmher
 Edited by Charel92  and saskl
 */

@Page({
    templateUrl: 'build/pages/tabs/tabs.html',
    providers: [Lists]
})

export class TabsPage {
    private nav;
    private intervalID;

    private stoplist = [];
    private linestops = [];
    private route = [];
    private lineroute = [];
    private rootParams = [];

    private selectedbus;
    private selectedline;
    private serverURL;

    private tab1Root;
    private tab2Root;
    private tab3Root;

    public map;
    public drive;
    public stops;

    constructor(nav:NavController, navParams:NavParams, private lists:Lists) {
        this.nav = nav;
        this.tab1Root = DrivePage;
        this.tab2Root = MapPage;
        this.tab3Root = StopsPage;

        this.selectedbus = navParams.get("selectedbus");
        this.selectedline = navParams.get("selectedline");
        this.serverURL = navParams.get("URL");

        this.getStoplist();
        this.getRoute();
        this.setRootParams();

        this.map = language.mapTitle;
        this.drive = language.driveTitle;
        this.stops = language.stopTitle;

        this.intervalID = setInterval(this.sendrealTimeData.bind(this), 15000)
        this.lists.postBusStatus(this.serverURL, this.selectedbus.id, this.selectedline.id)

    }

    /**
     * gets the stoplist from the server and removes stops which do not belong to the line
     */
    getStoplist() {
        this.lists.getStops(this.serverURL).subscribe(
            data => {
                this.stoplist = data.json();
                for (let index = 0; index < this.stoplist.length; index++) {
                    for (let jndex = 0; jndex < this.stoplist[index].lines.length; jndex++) {
                        if (this.selectedline.id === this.stoplist[index].lines[jndex]) {
                            console.log("jetzt wird gepusht", this.stoplist[index].name)
                            this.linestops.push(this.stoplist[index]);
                        }
                    }
                }
            },
            err => console.error(err),
            () => console.log('getStops completed')
        );
    }

    /**
     * gets the routes from the server and removes routes which do not belong to the line
     */
    getRoute() {
        this.lists.getRoutes(this.serverURL).subscribe(
            data => {
                this.route = data.json();
                console.log("jetzt wird die Route geladen:", this.selectedline.id);
                for (var index = 0; index < this.route[this.selectedline.id - 1].gpsData.length; index++) {
                    this.lineroute.push({
                        lat: this.route[this.selectedline.id - 1].gpsData[index].latitude,
                        lng: this.route[this.selectedline.id - 1].gpsData[index].longitude
                    })
                }
            },
            err => console.error(err),
            () => console.log('getRoute completed')
        );
    }

    /**
     * sets rootParams
     */
    setRootParams() {
        this.rootParams = [this.linestops, this.lineroute]
    }

    /**
     * sends the current position, the id of the selected bus and the time to the server
     */
    sendrealTimeData() {
        Geolocation.getCurrentPosition().then((resp) => {
            let latitude = resp.coords.latitude;
            let longitude = resp.coords.longitude;
            this.lists.postRealTimeData(this.serverURL, this.selectedbus.id, longitude, latitude)
        });
    }

    /**
     * alert when leaving, if you click "OK" GUI will change to HomePage and you will stop sending, if you click "Abbrechen" nothing will happen.
     */
    onPageWillLeave() {
        let alert = Alert.create({
            title: language.alertTitle,
            buttons: [{
                text: 'OK',
                handler: () => {
                    console.log('alert confirmed');
                    this.nav.setRoot(HomePage);
                    clearInterval(this.intervalID);
                }
            },
                {
                    text: language.alertCancel,
                    handler: () => {
                        console.log('alert aborted');
                    }
                }]
        });
        this.nav.present(alert);
    }
}
     
     
   
