// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  froalaKey: 'JA3B4A5A1qB1F1A4C3I1A15A10D3C6E5djknuC-21rzrD3kl==',
  backUrl: 'https://stage.squibler.io/api/v1',
  googleAuthKey: '1035784773457-hfmd7clskm5l1nbgjf8nuoccnvm98tdg.apps.googleusercontent.com'
};

export const testProjects = [
  {
    title: 'A Long Writing Night',
    date: 'May 26th, 2018',
    owner: 'Dhaval Bhhat',
    description: 'winner winner chicken dinner1',
    projectId: '1',
  },
  {
    title: 'A Long Summer times',
    date: 'May 26th, 2018',
    owner: 'Kim Karent',
    description: 'winner winner chicken dinner2',
    projectId: '2',
  },
  {
    title: 'A Long British Time',
    date: 'May 26th, 2018',
    owner: 'David Boui Bhhat',
    description: 'winner winner chicken dinner3',
    projectId: '3',
  },
];

export const addProjectData = {
  projectId: 1,
  input: 'Nighte',
  value: 'Saddness',
};

export const testSection = 1;

export const testSections = [
  {
    created_at: '2018-07-10T13:17:12.387256+00:00',
    id: 10,
    project_id: 8,
    synopsis: '12333',
    title: 'A Long Writing Night Section 1',
  },
  {
    created_at: '2018-07-09T13:17:12.387256+00:00',
    id: 11,
    project_id: 8,
    synopsis: '12333',
    title: 'www2',
  },
  {
    created_at: '2018-07-09T13:17:12.387256+00:00',
    id: 12,
    project_id: 8,
    synopsis: '12333',
    title: 'www3',
  },
];
export const testSectionAddData = {
  input: 'Test Add Section',
  projectId: 10,
  sectionId: null,
  textarea: 'similarer',
};
export const testSectionAddDataResponse = [
  {
    data: [
      {
        created_at: '2018-07-09T13:17:12.387256+00:00',
        id: 12,
        project_id: 8,
        synopsis: 'similarer',
        title: 'Test Add Section',
      },
    ],
  },
];
export const testSectionEditData = {
  input: 'Test Add Section',
  projectId: 10,
  sectionId: 10,
  textarea: 'similarer',
};
export const testSectionEditDataResponse = [
  {
    data: [
      {
        created_at: '2018-07-09T13:17:12.387256+00:00',
        id: 10,
        project_id: 10,
        synopsis: 'similarer',
        title: 'Test Add Section',
      },
    ],
    message: 'Section 10 updated',
    status: 'success',
  },
];
export const testSectionDeleteData = {
  project_id: 10,
  id: 10,
};
export const testSectionDeleteDataResponse = {
  message: 'Section 10 deleted',
  status: 'success',
};

export const testSubSection = {
  id: 10,
  sectionId: 10,
  projectId: 8,
};
export const testSubSections = [
  {
    created_at: '2018-07-10T13:17:12.387256+00:00',
    id: 10,
    section_id: 10,
    project_id: 8,
    synopsis: '12333',
    title: 'A Long Writing Night Section 1',
  },
  {
    created_at: '2018-07-09T13:17:12.387256+00:00',
    id: 11,
    project_id: 8,
    synopsis: '12333',
    title: 'www2',
  },
  {
    created_at: '2018-07-09T13:17:12.387256+00:00',
    id: 12,
    project_id: 8,
    synopsis: '12333',
    title: 'www3',
  },
];
export const testSubSectionAddData = {
  input: 'Test Add SubSection',
  projectId: 8,
  sectionId: 10,
  textarea: 'similarer',
  textFroala: {
    textarea: '<span>qwertyiner </span>',
  },
};
export const testSubSectionAddDataResponse = [
  {
    data: [
      {
        created_at: '2018-07-09T13:17:12.387256+00:00',
        id: 12,
        sectionId: 10,
        project_id: 8,
        synopsis: 'similarer',
        title: 'Test Add SubSection',
        textFroala: {
          textarea: '<span>qwertyiner </span>',
        },
      },
    ],
  },
];
export const testSubSectionEditData = {
  input: 'Test Add Section',
  projectId: 10,
  sectionId: 10,
  subSectionId: 10,
  textarea: 'similarer',
  textFroala: {
    textarea: '<span>qwertyiner </span>',
  },
};
export const testSubSectionEditDataResponse = [
  {
    data: [
      {
        created_at: '2018-07-09T13:17:12.387256+00:00',
        subSectionId: 10,
        section: 10,
        project_id: 8,
        synopsis: 'similarer',
        title: 'Test Add Section',
      },
    ],
    message: 'Section 10 updated',
    status: 'success',
  },
];
export const testSubSectionDeleteData = {
  projectId: 8,
  section_id: 10,
  id: 10,
};
export const testSubSectionDeleteDataResponse = {
  message: 'Section 10 deleted',
  status: 'success',
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
