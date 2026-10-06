import * as Rt from 'runtypes';

export type K8sObject = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    [x: string]: any;
  };
  [x: string]: any;
};

export const K8sObjectRuntype = Rt.Object({
  apiVersion: Rt.String,
  kind: Rt.String,
  metadata: Rt.Object({
    name: Rt.String,
  }),
});

export const isK8sObject = (value: unknown): value is K8sObject => K8sObjectRuntype.guard(value);
