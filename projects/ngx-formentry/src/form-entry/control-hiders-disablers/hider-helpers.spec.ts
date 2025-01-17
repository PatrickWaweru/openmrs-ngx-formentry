import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { HiderHelper } from './hider-helpers';
import { CanHide, Hider } from './can-hide';

describe('Control Hider Helper Service:', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HiderHelper]
    });
  });

  it('should be defined', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);
    expect(helper).toBeTruthy();
    // expect(factory.controlService).toBeTruthy();
  });

  it('should hide a control', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    const control: CanHide = {
      hidden: false,
      disabled: false,
      clearHidingFns: () => {},
      hide: () => {
        helper.hideControl(control);
      },
      disable: () => {
        control.disabled = true;
      },
      show: () => {},
      hiders: [],
      updateHiddenState: () => {},
      setHidingFn: (newHider: Hider) => {},
      setValue: (value: any) => {}
    };

    control.hide();

    expect(control.hidden).toBe(true);
    expect(control.disabled).toBe(true);
  });

  it('should show a control', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    const control: CanHide = {
      hidden: true,
      clearHidingFns: () => {},
      hide: () => {
        helper.hideControl(control);
      },
      show: () => {
        helper.showControl(control);
      },
      hiders: [],
      updateHiddenState: () => {},
      setHidingFn: (newHider: Hider) => {},
      setValue: (value: any) => {}
    };

    control.show();

    expect(control.hidden).toBe(false);
  });

  it('should set a hider for a control', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    const control: CanHide = {
      hidden: true,
      clearHidingFns: () => {},
      hide: () => {},
      show: () => {},
      hiders: [],
      updateHiddenState: () => {},
      setHidingFn: (newHider: Hider) => {
        helper.setHiderForControl(control, newHider);
      },
      setValue: (value: any) => {}
    };

    const hider: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {}
    };

    control.setHidingFn(hider);

    expect(control.hiders.length).toBe(1);
    expect(control.hiders[0]).toBe(hider);
  });

  it('should clear hiders for a control', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    const control: CanHide = {
      hidden: true,
      clearHidingFns: () => {
        helper.clearHidersForControl(control);
      },
      hide: () => {},
      show: () => {},
      hiders: [],
      updateHiddenState: () => {},
      setHidingFn: (newHider: Hider) => {},
      setValue: (value: any) => {}
    };

    const hider: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {}
    };

    helper.setHiderForControl(control, hider);

    expect(control.hiders.length).toBe(1);
    expect(control.hiders[0]).toBe(hider);

    control.clearHidingFns();

    expect(control.hiders.length).toBe(0);

    // should have set hidden to false after clearing
    expect(control.hidden).toBe(false);
  });

  it('should evaluate all controls hiders to determine whether to hide the control', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    // test case 1: should be hidden if one of the hiders is true
    const control: CanHide = {
      hidden: false,
      clearHidingFns: () => {},
      hide: () => {},
      show: () => {},
      hiders: [],
      updateHiddenState: () => {
        helper.evaluateControlHiders(control);
      },
      setHidingFn: (newHider: Hider) => {},
      setValue: (value: any) => {}
    };

    const hider1: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider1.toHide = true;
      }
    };

    const hider2: Hider = {
      toHide: true,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider2.toHide = false;
      }
    };

    const hider3: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider3.toHide = true;
      }
    };

    control.hiders.push(hider1);
    control.hiders.push(hider2);
    control.hiders.push(hider3);

    control.updateHiddenState();

    expect(control.hiders[0].toHide).toBe(true);
    expect(control.hiders[1].toHide).toBe(false);
    expect(control.hiders[2].toHide).toBe(true);
    expect(control.hidden).toBe(true);

    // test case 2: should not be hidden if none of the hiders is false
    const control2: CanHide = {
      hidden: true,
      clearHidingFns: () => {},
      hide: () => {},
      show: () => {},
      hiders: [],
      updateHiddenState: () => {
        helper.evaluateControlHiders(control2);
      },
      setHidingFn: (newHider: Hider) => {},
      setValue: (value: any) => {}
    };

    const hider4: Hider = {
      toHide: true,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider4.toHide = false;
      }
    };

    const hider5: Hider = {
      toHide: true,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider5.toHide = false;
      }
    };

    control2.hiders.push(hider4);
    control2.hiders.push(hider5);

    control2.updateHiddenState();

    expect(control2.hiders[0].toHide).toBe(false);
    expect(control2.hiders[1].toHide).toBe(false);
    expect(control2.hidden).toBe(false);
  });

  it('should trigger reEvaluation of a controls hidden status when control value changes', () => {
    const helper: HiderHelper = TestBed.inject(HiderHelper);

    const subject: Subject<any> = new Subject<any>();

    const control: CanHide = {
      hidden: false,
      clearHidingFns: () => {},
      hide: () => {},
      show: () => {},
      hiders: [],
      updateHiddenState: () => {
        helper.evaluateControlHiders(control);
      },
      setHidingFn: (newHider: Hider) => {},
      valueChanges: subject.asObservable(),
      setValue: (value: any) => {}
    };

    const hider1: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider1.toHide = true;
      }
    };

    const hider2: Hider = {
      toHide: true,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider2.toHide = false;
      }
    };

    const hider3: Hider = {
      toHide: false,
      hideWhenExpression: 'true',
      reEvaluateHidingExpression: () => {
        hider3.toHide = true;
      }
    };

    control.hiders.push(hider1);
    control.hiders.push(hider2);
    control.hiders.push(hider3);

    helper.setUpReEvaluationWhenValueChanges(control);

    expect(control.hiders[0].toHide).toBe(false);
    expect(control.hiders[1].toHide).toBe(true);
    expect(control.hiders[2].toHide).toBe(false);
    expect(control.hidden).toBe(false);

    subject.next(30);

    expect(control.hiders[0].toHide).toBe(true);
    expect(control.hiders[1].toHide).toBe(false);
    expect(control.hiders[2].toHide).toBe(true);
    expect(control.hidden).toBe(true);
  });
});
