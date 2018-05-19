import {
  Component,
  ViewChild,
  OnInit,
  Renderer2,
  ComponentFactoryResolver,
  ViewContainerRef
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

declare var particlesJS: any;


interface Data {
  name: string;
  priority: number;
  rankGroup?: [
    {
      rank: number;
      name: string;
    }
  ];
}
interface PriorityData {
  name: string;
  priority: number;
}
interface RankData {
  relatedPriority: number;
  data: [{
    rank: number;
    name: string;
  }];
}
interface PreviousRankData {
  relatedPriority: number;
  html: HTMLCollection;
}
interface ResultData {
  totalRank: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private dataList: Data[] = [];
  private priorityDataList: PriorityData[] = [];
  private rankDataList: RankData[] = [];
  private previousRankList: PreviousRankData[] = [];
  private domain = 'https://helpmetochoose.herokuapp.com';
  public priorityName: string;
  public resultList: ResultData[];
  constructor(private renderer: Renderer2, private http: Http) {
    this.addPriorityChangeEvent = this.addPriorityChangeEvent.bind(this);
    this.addRankChangeEvent = this.addRankChangeEvent.bind(this);
    this.addRankNumberChangeEvent = this.addRankNumberChangeEvent.bind(this);
    this.addRemoveEvent = this.addRemoveEvent.bind(this);
    this.addPriorityUpDownEvent = this.addPriorityUpDownEvent.bind(this);
  }

  ngOnInit() {
    particlesJS.load('particles-js', 'assets/js/particles.json', function () {
      console.log('callback - particles-js config loaded');
    });
    this.addAllEvents();
    this.disableRankInput(true);
  }

  // Actions
  addAllEvents() {
    const priorityInputs = document.querySelectorAll('.priority_input');
    const rankDataInputs = document.querySelectorAll('.rank_data_input');
    const rankNumberInputs = document.querySelectorAll('.rank_number_input');
    const removes = document.querySelectorAll('.remove');
    const priorityUpDowns = document.querySelectorAll('.priority_up, .priority_down');

    Array.from(priorityInputs).forEach(elem => {
      elem.removeEventListener('change', this.addPriorityChangeEvent);
      elem.addEventListener('change', this.addPriorityChangeEvent);
    });
    Array.from(rankDataInputs).forEach(elem => {
      elem.removeEventListener('change', this.addRankChangeEvent);
      elem.addEventListener('change', this.addRankChangeEvent);
    });
    Array.from(rankNumberInputs).forEach(elem => {
      elem.removeEventListener('change', this.addRankNumberChangeEvent);
      elem.addEventListener('change', this.addRankNumberChangeEvent);
    });
    Array.from(removes).forEach(elem => {
      elem.removeEventListener('click', this.addRemoveEvent);
      elem.addEventListener('click', this.addRemoveEvent);
    });
    Array.from(priorityUpDowns).forEach(elem => {
      elem.removeEventListener('click', this.addPriorityUpDownEvent);
      elem.addEventListener('click', this.addPriorityUpDownEvent);
    });
  }
  addInput(currentList, currentInput) {
    let lastInputIndex: number;
    // copying
    const clone: HTMLInputElement = currentInput.cloneNode(true);
    // cleaning default input value
    (<HTMLInputElement>clone.querySelector('.cleanup')).value = '';

    if (currentInput.getAttribute('class').includes('priority_input_holder')) {
      // adding input to the last
      lastInputIndex = parseInt(
        currentList.lastElementChild.getAttribute('data-index'),
        10
      );
      this.renderer.setAttribute(clone, 'data-index', (lastInputIndex + 1).toString());
    } else if (currentInput.getAttribute('class').includes('rank_input_holder')) {
      (<HTMLInputElement>clone.querySelector('.rank_number_input')).value = '';
    }

    // adding input
    this.renderer.appendChild(currentList, clone);
    console.log('input added');
    this.addAllEvents();
  }
  next() {
    console.log('next');
    const rankInputList = document.querySelector('.rank_input_list');
    const priorityInputList = document.querySelector('.priority_input_list');
    const priorityInputHolders = document.querySelectorAll('.priority_input_holder');
    const rankListRelatedPriority = parseInt(rankInputList.getAttribute('data-related-priority'), 10);
    const priorityLastInputIndex = parseInt(priorityInputList.lastElementChild.getAttribute('data-index'), 10);
    if (rankListRelatedPriority < priorityLastInputIndex) {
      // To Check whether the input of related priority input is filled
      const nextPriorityInput = Array.from(priorityInputHolders).filter((pInput) => {
        const PIHoderIndex = parseInt(pInput.getAttribute('data-index'), 10);
        return PIHoderIndex === (rankListRelatedPriority + 1);
      })[0];
      const isInputFilled = (<HTMLInputElement>nextPriorityInput.querySelector('.priority_input')).value !== '';
      if (isInputFilled) {

        this.safeCurrentRankInputData();
        console.log('this.dataList', this.dataList);

        const properNextRankList = this.dataList.filter(data => {
          return data.priority === (rankListRelatedPriority + 1);
        })[0];
        this.fillRankInputs(properNextRankList);

        this.addAllEvents();

        // change data-related-priority attribute of rank_input_list
        rankInputList.setAttribute('data-related-priority', (rankListRelatedPriority + 1).toString());
        this.setPriorityNameOnRankTitle();
      }
      // when everthing is filled
    } else if (rankListRelatedPriority === priorityLastInputIndex) {
      this.safeCurrentRankInputData();
      console.log('this.dataList', this.dataList);

      const headers = new Headers({
        'Content-Type': 'application/json;charset=utf-8'
      });
      const options = new RequestOptions({ headers: headers });
      this.http.post(this.domain + '/dataProcess', JSON.stringify(this.dataList), options).map(res => res.json())
        .subscribe(data => {
          this.resultList = data;
          console.log('this.resultList', this.resultList);
          setTimeout(this.scrollToResult, 100);
        });
      console.log('Sent to backend');
    }
  }
  previous() {
    console.log('previous');
    const rankInputList = document.querySelector('.rank_input_list');
    const priorityInputHolders = document.querySelectorAll('.priority_input_holder');
    const rankListRelatedPriority = parseInt(rankInputList.getAttribute('data-related-priority'), 10);
    const previousRankListRelatedPriority = rankListRelatedPriority - 1;
    if (rankListRelatedPriority > 0) {
      // To Check whether the input of related priority input is filled
      const previousPriorityInput = Array.from(priorityInputHolders).filter((pInput) => {
        const PIHoderIndex = parseInt(pInput.getAttribute('data-index'), 10);
        return PIHoderIndex === previousRankListRelatedPriority;
      })[0];
      const isInputFilled = (<HTMLInputElement>previousPriorityInput.querySelector('.priority_input')).value !== '';
      if (isInputFilled) {

        this.safeCurrentRankInputData();
        console.log('this.dataList', this.dataList);

        const properPreviousRankList = this.dataList.filter(data => {
          return data.priority === previousRankListRelatedPriority;
        })[0];
        this.fillRankInputs(properPreviousRankList);

        this.addAllEvents();

        // change data-related-priority attribute of rank_input_list
        rankInputList.setAttribute('data-related-priority', previousRankListRelatedPriority.toString());
        this.setPriorityNameOnRankTitle();
      }
    }
  }




  // Events
  addPriorityChangeEvent() {
    console.log('addPriorityChangeEvent');
    const priorityInputHolders = document.querySelectorAll('.priority_input_holder');
    this.priorityDataList = [];
    Array.from(priorityInputHolders).forEach(PIHolder => {
      const PIHolderIndex = PIHolder.getAttribute('data-index');
      const PInput = PIHolder.querySelector('.priority_input');
      if ((<HTMLInputElement>PInput).value !== '') {
        this.priorityDataList.push({
          priority: parseInt(PIHolderIndex, 10),
          name: (<HTMLInputElement>PInput).value
        });
      }
    });
    // once priority list is filled enable rank inputs
    if (this.priorityDataList.length > 0) {
      this.disableRankInput(false);
    } else {
      this.disableRankInput(true);
    }
    this.setPriorityNameOnRankTitle();
    console.log('priorityDataList', this.priorityDataList);
  }
  addRankChangeEvent() {
    console.log('addRankChangeEvent');
    const rankInputListRelatedPriorityIndex = document.querySelector('.rank_input_list').getAttribute('data-related-priority');
    const rankInputHolders = document.querySelectorAll('.rank_input_holder');
    const dataToAdd = {
      relatedPriority: parseInt(rankInputListRelatedPriorityIndex, 10),
      data: []
    };

    Array.from(rankInputHolders).forEach(RIHolder => {
      const rankNumberInput = RIHolder.querySelector('.rank_number_input');
      const rankDataInput = RIHolder.querySelector('.rank_data_input');
      if ((<HTMLInputElement>rankDataInput).value !== '' && (<HTMLInputElement>rankNumberInput).value !== '') {
        dataToAdd.data.push({
          rank: parseInt((<HTMLInputElement>rankNumberInput).value, 10),
          name: (<HTMLInputElement>rankDataInput).value
        });
      }
    });
    this.rankDataList = [];
    this.rankDataList.push(<RankData>dataToAdd);
    console.log('this.rankDataList', this.rankDataList);
  }
  addRankNumberChangeEvent($event) {
    const rankNumberInputsHolder = document.querySelectorAll('.rank_input_holder');
    const currentRankNumberInputHolder = (<HTMLInputElement>event.target).parentElement;
    const currentRankNumberInput = (<HTMLInputElement>event.target);

    const lessRankInputs = Array.from(rankNumberInputsHolder).filter(rIHolder => {
      const rankNumberInputIndex = (<HTMLInputElement>rIHolder.querySelector('.rank_number_input')).value;
      return parseInt(rankNumberInputIndex, 10) < parseInt(currentRankNumberInput.value, 10);
    });
    const lessRankInput = lessRankInputs[lessRankInputs.length - 1];
    if (lessRankInput) {
      currentRankNumberInputHolder.parentElement.removeChild(currentRankNumberInputHolder);
      lessRankInput.parentElement.insertBefore(currentRankNumberInputHolder, lessRankInput.nextElementSibling);
    } else {
      const rankInputList = document.querySelector('.rank_input_list');
      rankInputList.insertBefore(
        currentRankNumberInputHolder, rankInputList.firstChild);
    }
    this.addRankChangeEvent();
  }
  addPriorityUpDownEvent($event) {
    const priorityInputCurrent = (<HTMLElement>event.target).parentElement
      .parentElement;
    const dataIndexCurrent = parseInt(
      priorityInputCurrent.getAttribute('data-index'),
      10
    );
    let priorityInputUpDown;
    if ((<HTMLElement>event.target).getAttribute('class') === 'priority_up') {
      priorityInputUpDown = priorityInputCurrent.parentElement.querySelector(
        '[data-index="' +
        (dataIndexCurrent > 1 ? dataIndexCurrent - 1 : dataIndexCurrent) +
        '"]'
      );
    } else if (
      (<HTMLElement>event.target).getAttribute('class') === 'priority_down'
    ) {
      priorityInputUpDown = priorityInputCurrent.parentElement.querySelector(
        '[data-index="' +
        (dataIndexCurrent < priorityInputCurrent.parentElement.children.length
          ? dataIndexCurrent + 1
          : dataIndexCurrent) +
        '"]'
      );
    }
    [
      (<HTMLInputElement>priorityInputCurrent.querySelector('.priority_input'))
        .value,
      (<HTMLInputElement>priorityInputUpDown.querySelector('.priority_input'))
        .value
    ] = [
        (<HTMLInputElement>priorityInputUpDown.querySelector('.priority_input'))
          .value,
        (<HTMLInputElement>priorityInputCurrent.querySelector('.priority_input'))
          .value
      ];

    // firing change event on input priority data
    this.addPriorityChangeEvent();
    this.setPriorityNameOnRankTitle();
  }
  addRemoveEvent($event) {
    console.log('event.target', event.target);
    const currentInputHolder = (<HTMLElement>event.target).parentElement;
    console.log('currentInputHolder', currentInputHolder);
    const parentOfSelectedElement = currentInputHolder.parentElement;
    console.log('parentOfSelectedElement', parentOfSelectedElement);
    // decrease data-index of elements after this element
    Array.from(parentOfSelectedElement.children).forEach(elem => {
      if (elem.getAttribute('data-index') > currentInputHolder.getAttribute('data-index')) {
        elem.setAttribute(
          'data-index', (parseInt(elem.getAttribute('data-index'), 10) - 1).toString()
        );
      }
    });
    if (parentOfSelectedElement.children.length > 1) {
      console.log('remove');
      (<HTMLInputElement>currentInputHolder.querySelector('.cleanup')).value = '';
      currentInputHolder.parentNode.removeChild(currentInputHolder);
      this.setPriorityNameOnRankTitle();
    }
    if (currentInputHolder.className === 'rank_input_holder') {
      this.addRankChangeEvent();
    } else if (currentInputHolder.className === 'priority_input_holder') {
      console.log('qweaszxc');
      this.addPriorityChangeEvent();
    }
  }



  // Helpers
  safeCurrentRankInputData() {
    // saving current input data
    this.priorityDataList.forEach(pData => {
      this.rankDataList.forEach(rData => {
        if (pData.priority === rData.relatedPriority) {
          this.dataList.forEach(data => {
            // if data exists
            if (data.priority === pData.priority) {
              // remove
              this.dataList.splice(this.dataList.indexOf(data), 1);
            }
          });
          this.dataList.push({
            priority: pData.priority,
            name: pData.name,
            rankGroup: rData.data
          });
        }
      });
    });
  }
  fillRankInputs(properRankList) {
    const rankInputHolder = document.querySelector('.rank_input_holder');
    const rankInputList = document.querySelector('.rank_input_list');
    if (properRankList) {
      // remove all inputs
      while (rankInputList.children.length) {
        rankInputList.removeChild(rankInputList.firstChild);
      }
      // adding all previous inputs
      properRankList.rankGroup.forEach(rData => {
        const clonedRankInputHolder = rankInputHolder.cloneNode(true);
        const rankNumberClone = (<HTMLElement>clonedRankInputHolder).querySelector('.rank_number_input');
        const rankDataClone = (<HTMLElement>clonedRankInputHolder).querySelector('.rank_data_input');
        (<HTMLInputElement>rankNumberClone).value = (rData.rank).toString();
        (<HTMLInputElement>rankDataClone).value = (rData.name).toString();
        rankDataClone.addEventListener('change', this.addRankChangeEvent);
        rankInputList.appendChild(clonedRankInputHolder);
      });
    } else {
      // clear all rank data inputs
      Array.from(rankInputList.querySelectorAll('.rank_data_input')).forEach(input => {
        (<HTMLInputElement>input).value = '';
      });
    }
  }
  setPriorityNameOnRankTitle() {
    this.priorityName = '';
    const currentRankRelatedPriorityIndex = parseInt(document.querySelector('.rank_input_list').getAttribute('data-related-priority'), 10);
    this.priorityDataList.forEach(data => {
      if (data.priority === currentRankRelatedPriorityIndex) {
        this.priorityName = data.name;
      }
    });
  }
  disableRankInput(option) {
    Array.from(document.querySelectorAll('.rank_number_input, .rank_data_input')).forEach(elem => {
      (<HTMLInputElement>elem).disabled = option;
    });
  }
  scrollToResult() {
    const offsets = document.querySelector('.data_result').getBoundingClientRect();
    const smoothScroll = (scrollToY, windowPos) => {
      let i = windowPos;
      const int = setInterval(function () {
        window.scrollTo(0, i);
        i += 10;
        if (i >= scrollToY) {
          clearInterval(int);
        }
      }, 5);
    };

    if (window.innerHeight > offsets.height) {
      smoothScroll((offsets.top + window.pageYOffset) - (window.innerHeight - offsets.height), window.pageYOffset);
    } else if (window.innerHeight < offsets.height) {
      smoothScroll(offsets.top + window.pageYOffset, window.pageYOffset);
    }
  }
}
