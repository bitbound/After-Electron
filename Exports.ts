import * as Components from './Components/All';
import * as Models from "./Models/All";
import * as API from "./API/All"
import * as Commands from "./Components/Commands/All";
import * as SocketMessages from "./Components/SocketMessages/All"

Components["Commands"] = Commands;
Components["SocketMessages"] = SocketMessages;
export {Components};
export {Models};
export {API};