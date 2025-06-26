import { LightningElement } from 'lwc';

export default class AccordionGroup extends LightningElement {
  handleSetActiveSectionC() {
    const accordion = this.template.querySelector('.example-accordion');

    accordion.activeSectionName = 'C';
  }
}