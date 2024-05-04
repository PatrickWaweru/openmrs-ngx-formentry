import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { PredictionObject } from './types';
import moment from 'moment';

@Injectable()
export class MachineLearningService {
  constructor(private http: HttpClient) {}

  public fetchPredictionScore(predicationPayload) {
    // const url = `/openmrs/ws/rest/v1/keml/casefindingscore`;
    const url = `http://localhost:9677/openmrs/ws/rest/v1/keml/casefindingscore`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', 'Basic YWRtaW46QWRtaW4xMjM=');
    return this.http.post(url, predicationPayload, { headers: headers });
  }

  public predictRisk(res): [number, string] {
    const prediction = res.result.predictions['probability(Positive)'];

    const lowRiskThreshold = res.result.thresholds['Medium'];
    const mediumRiskThreshold = res.result.thresholds['High'];
    const highRiskThreshold = res.result.thresholds['Very_High'];

    const riskThresholds = {
      lowRisk: lowRiskThreshold,
      mediumRisk: mediumRiskThreshold,
      highRisk: highRiskThreshold
    };

    console.warn("Low Risk Threshold is: ", lowRiskThreshold);
    console.warn("Medium Risk Threshold is: ", mediumRiskThreshold);
    console.warn("High Risk Threshold is: ", highRiskThreshold);
    console.warn("Got prediction as: ", prediction);

    const riskMessages = {
      veryHigh:
        'Client has a very high probability of a HIV positive test result. Testing is strongly recommended',
      high:
        'Client has a high probability of a HIV positive test result. Testing is strongly recommended',
      medium:
        'Client has a medium probability of a HIV positive test result. Testing is recommended',
      low:
        'Client has a low probability of a HIV positive test result. Testing may not be recommended',
      noResults: 'No results found'
    };

    if (!prediction) {
      return [0, riskMessages.noResults];
    }

    if (prediction > riskThresholds.highRisk) {
      return [4, riskMessages.veryHigh];
    } else if (prediction > riskThresholds.mediumRisk) {
      return [3, riskMessages.high];
    } else if (prediction > riskThresholds.lowRisk) {
      return [2, riskMessages.medium];
    } else {
      return [1, riskMessages.low];
    }
  }

  public mapToMLModel(result: any, patientAge: number): PredictionObject {
    const dateSelf = result['dateSelf']
      ? moment(result['dateSelf']).diff(new Date())
      : 0;
    const dateProvider = result['dateProvider']
      ? moment(result['dateProvider']).diff(new Date())
      : 0;

    return {
      pAge: patientAge,
      latestMaritalStatus: '',
      populationType: result['populationType'] ?? '',
      keyPopulationVal: result['kpTypeMale'] ?? result['kpTypeFemale'] ?? '',
      priPopulationVal: result['ppType'] ?? '',
      testHistory: result['testHistory'] ?? '',
      testedAs: '',
      htsEntryPoint: result['facilityHTStrategy'] ?? '',
      htsDepartment: result['patDepart'] ?? '',
      monthsSinceLastTestInt: dateProvider ?? dateSelf ?? 0,
      testStrategy: result['facilityHTStrategy'] ?? '',
      selfTested: result['teSteR'] ?? '',
      tbScreening: result['screenedTB'] ?? '',
      tbFever: result['fever'] ?? '',
      tbNightSweats: result['experiencingSweats'] ?? '',
      tbCough: result['coughDuration'] ?? '',
      tbScreeningStatus: result['tbResultstaTuS'] ?? '',
      everHadSex: result['sexuallyActive'] ?? '',
      multipleSexPartners: result['multipleSexPartners'] ?? '',
      patientType: result['patienTyPe'] ?? '',
      onPREP: result['currentlyPrep'] ?? '',
      hasSTI: result['currentlySti'] ?? '',
      activeSexually: result['activeSexually'] ?? '',
      newPartner: result['newPartner'] ?? '',
      isHealthWorker: result['hcwCare'] ?? '',
      partnerHIVStatus: result['partnerHivStatus'] ?? '',
      numberOfPartnersInt: result['noSexPartners'] ?? '',
      alcoholicSex: result['alcoholicSex'] ?? '',
      moneySex: result['moneySex'] ?? '',
      condomBurst: result['condomBurst'] ?? '',
      strangerSex: result['strangerSex'] ?? '',
      positiveSex: result['knownPositive'] ?? '',
      patientPregnant: result['preGnant'] ?? '',
      patientBreastFeeding: result['breastfeeding'] ?? '',
      GBVExperienced: result['experiencedGbv'] ?? '',
      sharedNeedle: result['needleShared'] ?? '',
      needleStickInjuries: result['needleStick'] ?? '',
      traditionalProcedures: result['__tDI8Dp4Ly'] ?? '',
      mothersStatus: result['motHersHivstatus'],
      patientReferred: result['clientReferred'] ?? '',
      discordantCouple: result['coupleDiscordant'] ?? '',
      sexualContactChecked:
        result['cricAdulT'] === '163565AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          ? true
          : false,
      socialContactChecked:
        result['cricAdulT'] === '166606AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          ? true
          : false,
      noneContactChecked:
        result['cricAdulT'] === '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          ? true
          : false,
      needleSharingContactChecked:
        result['cricAdulT'] === '166517AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          ? true
          : false,
      prepServiceChecked: result['prepService'] ? true : false,
      pepServiceChecked: result['pepService'] ? true : false,
      tbServiceChecked: false,
      stiServiceChecked: result['stiService'] ? true : false,
      GBVSexualChecked: false,
      GBVPhysicalChecked: false,
      GBVEmotionalChecked: false
    };
  }
}
