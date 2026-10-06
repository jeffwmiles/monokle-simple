import {disabledClusterOperations} from '@src/kindhandlers/common/disabledClusterOperations';


import {cloneDeep} from 'lodash';
import log from 'loglevel';
import path from 'path';

import navSectionNames from '@constants/navSectionNames';

import {extractSchema} from '@redux/services/schema';
import {findDefaultVersionForCRD} from '@redux/thunks/cluster';


import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {loadResource} from '@shared/utils/resource';

/**
 * The logic for these custom kind handlers will have to be revisited after we integrate @monokle/validation
 * I'm thinking that we will have to find a way to extend the 'resource-link' plugin of the validation to include more ref mappers
 * The custom matchers like "implicitNamespaceMatcher", "optionalExplicitNamespaceMatcher" or "targetKindMatcher" should probably be exported by the validation package
 */

/**
 * extract the version from the apiVersion string of the specified resource
 */



export function extractFormSchema(editorSchema: any) {
  const schema: any = cloneDeep(editorSchema);
  if (schema && schema.properties) {
    // remove common object properties since these are shown in a separate form
    delete schema.properties['apiVersion'];
    delete schema.properties['kind'];
    delete schema.properties['metadata'];

    // delete incomplete properties at root level, see sealed-secret.yaml
    Object.keys(schema.properties).forEach(key => {
      // property without type?
      if (!schema.properties[key].type) {
        delete schema.properties[key];
      }
      // object without properties?
      else if (schema.properties[key].type === 'object' && !schema.properties[key].properties) {
        delete schema.properties[key];
      }
    });
  }

  return schema;
}

export function extractKindHandler(crd: any, handlerPath?: string) {
  if (!crd?.spec) {
    return;
  }

  const spec = crd.spec;
  const kind = spec.names.kind;
  const kindGroup = spec.group;
  const kindVersion = findDefaultVersionForCRD(crd);

  if (kindVersion) {
    const kindPlural = spec.names.plural;
    let editorSchema = kindVersion ? extractSchema(crd, kindVersion) : undefined;
    let kindHandler: ResourceKindHandler | undefined;
    let helpLink: string | undefined;
    let subsectionName = spec.group;
    let kindSectionName = spec.names.plural;

    if (handlerPath) {
      try {
        const handlerContent = loadResource(`${handlerPath}${path.sep}${kindGroup}${path.sep}${kind}.json`);

        if (handlerContent) {
          const handler = JSON.parse(handlerContent);
          if (handler) {
            helpLink = handler.helpLink;
            subsectionName = handler.sectionName || subsectionName;
            kindSectionName = handler.kindSectionName || kindSectionName;
            if (handler.editorSchema) {
              editorSchema = handler.editorSchema;
            }
          }
        }
      } catch (e) {
        log.warn(`Failed to parse kindhandler`, e);
      }
    }

    if (spec.scope === 'Namespaced') {
      kindHandler = createNamespacedCustomObjectKindHandler(
        kind,
        subsectionName,
        kindSectionName,
        kindGroup,
        kindVersion,
        kindPlural,
        editorSchema,
        helpLink
      );
    } else if (spec.scope === 'Cluster') {
      kindHandler = createClusterCustomObjectKindHandler(
        kind,
        subsectionName,
        kindSectionName,
        kindGroup,
        kindVersion,
        kindPlural,
        editorSchema,
        helpLink
      );
    }

    return kindHandler;
  }
}

const createNamespacedCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: `${kindGroup}/*`,
    isNamespaced: true,
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    isCustom: true,
    kindPlural,
    helpLink,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
    ...disabledClusterOperations,
    
    
  };
};

const createClusterCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: `${kindGroup}/*`,
    isNamespaced: false,
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    helpLink,
    isCustom: true,
    kindPlural,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
    ...disabledClusterOperations,
    
    
  };
};
