import { Flight} from "../types";
import {id} from "./util";

export const flight = (partial: Partial<Flight>): Flight => ({
    id: id(),
    name: "Lento",
    ...partial
})