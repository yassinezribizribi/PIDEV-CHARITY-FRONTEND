import { Subscriber } from "./subscriber.model";

export class Training {
    idTraining:number
    trainingName: string;
    description: string;
    duration: number;
    capacity: number;
    level: string;
    type: string;
    sessionDate: Date;
    subscribers?: Subscriber[];
  
    constructor(
        idTraining:number,
      trainingName: string,
      description: string,
      duration: number,
      capacity: number,
      level: string,
      type: string,
      sessionDate: Date
    ) {
        this.idTraining=idTraining
      this.trainingName = trainingName;
      this.description = description;
      this.duration = duration;
      this.capacity = capacity;
      this.level = level;
      this.type = type;
      this.sessionDate = sessionDate;
    }
  }
  