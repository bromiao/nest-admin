export const MENU_LIST = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: '/dashboard/analysis',
    meta: {
      orderNo: 10,
      icon: 'ion:grid-outline',
      title: 'routes.dashboard.dashboard',
    },
    children: [
      {
        path: 'analysis',
        name: 'Analysis',
        meta: {
          title: 'routes.dashboard.analysis',
        },
      },
      {
        path: 'workbench',
        name: 'Workbench',
        meta: {
          title: 'routes.dashboard.workbench',
        },
      },
    ],
  },
  {
    path: '/charts',
    name: 'Charts',
    redirect: '/charts/echarts/map',
    meta: {
      orderNo: 500,
      icon: 'ion:bar-chart-outline',
      title: 'routes.demo.charts.charts',
    },
    children: [
      {
        path: 'baiduMap',
        name: 'BaiduMap',
        meta: {
          title: 'routes.demo.charts.baiduMap',
        },
      },
      {
        path: 'aMap',
        name: 'AMap',
        meta: {
          title: 'routes.demo.charts.aMap',
        },
      },
      {
        path: 'googleMap',
        name: 'GoogleMap',
        meta: {
          title: 'routes.demo.charts.googleMap',
        },
      },
      {
        path: 'echarts',
        name: 'Echarts',
        meta: {
          title: 'Echarts',
        },
        redirect: '/charts/echarts/map',
        children: [
          {
            path: 'map',
            name: 'Map',
            meta: {
              title: 'routes.demo.charts.map',
            },
          },
          {
            path: 'line',
            name: 'Line',
            meta: {
              title: 'routes.demo.charts.line',
            },
          },
          {
            path: 'pie',
            name: 'Pie',
            meta: {
              title: 'routes.demo.charts.pie',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/comp',
    name: 'Comp',
    redirect: '/comp/basic',
    meta: {
      orderNo: 30,
      icon: 'ion:layers-outline',
      title: 'routes.demo.comp.comp',
    },
    children: [
      {
        path: 'basic',
        name: 'BasicDemo',
        meta: {
          title: 'routes.demo.comp.basic',
        },
      },
      {
        path: 'form',
        name: 'FormDemo',
        redirect: '/comp/form/basic',
        meta: {
          title: 'routes.demo.form.form',
        },
        children: [
          {
            path: 'basic',
            name: 'FormBasicDemo',
            meta: {
              title: 'routes.demo.form.basic',
            },
          },
          {
            path: 'useForm',
            name: 'UseFormDemo',
            meta: {
              title: 'routes.demo.form.useForm',
            },
          },
          {
            path: 'refForm',
            name: 'RefFormDemo',
            meta: {
              title: 'routes.demo.form.refForm',
            },
          },
          {
            path: 'advancedForm',
            name: 'AdvancedFormDemo',
            meta: {
              title: 'routes.demo.form.advancedForm',
            },
          },
          {
            path: 'ruleForm',
            name: 'RuleFormDemo',
            meta: {
              title: 'routes.demo.form.ruleForm',
            },
          },
          {
            path: 'dynamicForm',
            name: 'DynamicFormDemo',
            meta: {
              title: 'routes.demo.form.dynamicForm',
            },
          },
          {
            path: 'customerForm',
            name: 'CustomerFormDemo',
            meta: {
              title: 'routes.demo.form.customerForm',
            },
          },
          {
            path: 'appendForm',
            name: 'appendFormDemo',
            meta: {
              title: 'routes.demo.form.appendForm',
            },
          },
          {
            path: 'tabsForm',
            name: 'tabsFormDemo',
            meta: {
              title: 'routes.demo.form.tabsForm',
            },
          },
        ],
      },
      {
        path: 'table',
        name: 'TableDemo',
        redirect: '/comp/table/basic',
        meta: {
          title: 'routes.demo.table.table',
        },
        children: [
          {
            path: 'basic',
            name: 'TableBasicDemo',
            meta: {
              title: 'routes.demo.table.basic',
            },
          },
          {
            path: 'treeTable',
            name: 'TreeTableDemo',
            meta: {
              title: 'routes.demo.table.treeTable',
            },
          },
          {
            path: 'fetchTable',
            name: 'FetchTableDemo',
            meta: {
              title: 'routes.demo.table.fetchTable',
            },
          },
          {
            path: 'fixedColumn',
            name: 'FixedColumnDemo',
            meta: {
              title: 'routes.demo.table.fixedColumn',
            },
          },
          {
            path: 'customerCell',
            name: 'CustomerCellDemo',
            meta: {
              title: 'routes.demo.table.customerCell',
            },
          },
          {
            path: 'formTable',
            name: 'FormTableDemo',
            meta: {
              title: 'routes.demo.table.formTable',
            },
          },
          {
            path: 'useTable',
            name: 'UseTableDemo',
            meta: {
              title: 'routes.demo.table.useTable',
            },
          },
          {
            path: 'refTable',
            name: 'RefTableDemo',
            meta: {
              title: 'routes.demo.table.refTable',
            },
          },
          {
            path: 'multipleHeader',
            name: 'MultipleHeaderDemo',
            meta: {
              title: 'routes.demo.table.multipleHeader',
            },
          },
          {
            path: 'mergeHeader',
            name: 'MergeHeaderDemo',
            meta: {
              title: 'routes.demo.table.mergeHeader',
            },
          },
          {
            path: 'expandTable',
            name: 'ExpandTableDemo',
            meta: {
              title: 'routes.demo.table.expandTable',
            },
          },
          {
            path: 'fixedHeight',
            name: 'FixedHeightDemo',
            meta: {
              title: 'routes.demo.table.fixedHeight',
            },
          },
          {
            path: 'footerTable',
            name: 'FooterTableDemo',
            meta: {
              title: 'routes.demo.table.footerTable',
            },
          },
          {
            path: 'editCellTable',
            name: 'EditCellTableDemo',
            meta: {
              title: 'routes.demo.table.editCellTable',
            },
          },
          {
            path: 'editRowTable',
            name: 'EditRowTableDemo',
            meta: {
              title: 'routes.demo.table.editRowTable',
            },
          },
          {
            path: 'authColumn',
            name: 'AuthColumnDemo',
            meta: {
              title: 'routes.demo.table.authColumn',
            },
          },
          {
            path: 'resizeParentHeightTable',
            name: 'ResizeParentHeightTable',
            meta: {
              title: 'routes.demo.table.resizeParentHeightTable',
            },
          },
          {
            path: 'vxeTable',
            name: 'VxeTableDemo',
            meta: {
              title: 'routes.demo.table.vxeTable',
            },
          },
        ],
      },
      {
        path: 'transition',
        name: 'transitionDemo',
        meta: {
          title: 'routes.demo.comp.transition',
        },
      },
      {
        path: 'cropper',
        name: 'CropperDemo',
        meta: {
          title: 'routes.demo.comp.cropperImage',
        },
      },
      {
        path: 'timestamp',
        name: 'TimeDemo',
        meta: {
          title: 'routes.demo.comp.time',
        },
      },
      {
        path: 'countTo',
        name: 'CountTo',
        meta: {
          title: 'routes.demo.comp.countTo',
        },
      },
      {
        path: 'tree',
        name: 'TreeDemo',
        redirect: '/comp/tree/basic',
        meta: {
          title: 'routes.demo.comp.tree',
        },
        children: [
          {
            path: 'basic',
            name: 'BasicTreeDemo',
            meta: {
              title: 'routes.demo.comp.treeBasic',
            },
          },
          {
            path: 'editTree',
            name: 'EditTreeDemo',
            meta: {
              title: 'routes.demo.comp.editTree',
            },
          },
          {
            path: 'actionTree',
            name: 'ActionTreeDemo',
            meta: {
              title: 'routes.demo.comp.actionTree',
            },
          },
        ],
      },
      {
        path: 'editor',
        name: 'EditorDemo',
        redirect: '/comp/editor/markdown',
        meta: {
          title: 'routes.demo.editor.editor',
        },
        children: [
          {
            path: 'json',
            name: 'JsonEditorDemo',
            meta: {
              title: 'routes.demo.editor.jsonEditor',
            },
          },
          {
            path: 'markdown',
            name: 'MarkdownDemo',
            meta: {
              title: 'routes.demo.editor.markdown',
            },
            redirect: '/comp/editor/markdown/index',
            children: [
              {
                path: 'index',
                name: 'MarkDownBasicDemo',
                meta: {
                  title: 'routes.demo.editor.tinymceBasic',
                },
              },
              {
                path: 'editor',
                name: 'MarkDownFormDemo',
                meta: {
                  title: 'routes.demo.editor.tinymceForm',
                },
              },
            ],
          },
          {
            path: 'tinymce',
            name: 'TinymceDemo',
            meta: {
              title: 'routes.demo.editor.tinymce',
            },
            redirect: '/comp/editor/tinymce/index',
            children: [
              {
                path: 'index',
                name: 'TinymceBasicDemo',
                meta: {
                  title: 'routes.demo.editor.tinymceBasic',
                },
              },
              {
                path: 'editor',
                name: 'TinymceFormDemo',
                meta: {
                  title: 'routes.demo.editor.tinymceForm',
                },
              },
            ],
          },
        ],
      },
      {
        path: 'scroll',
        name: 'ScrollDemo',
        redirect: '/comp/scroll/basic',
        meta: {
          title: 'routes.demo.comp.scroll',
        },
        children: [
          {
            path: 'basic',
            name: 'BasicScrollDemo',
            meta: {
              title: 'routes.demo.comp.scrollBasic',
            },
          },
          {
            path: 'action',
            name: 'ActionScrollDemo',
            meta: {
              title: 'routes.demo.comp.scrollAction',
            },
          },
          {
            path: 'virtualScroll',
            name: 'VirtualScrollDemo',
            meta: {
              title: 'routes.demo.comp.virtualScroll',
            },
          },
        ],
      },
      {
        path: 'modal',
        name: 'ModalDemo',
        meta: {
          title: 'routes.demo.comp.modal',
        },
      },
      {
        path: 'drawer',
        name: 'DrawerDemo',
        meta: {
          title: 'routes.demo.comp.drawer',
        },
      },
      {
        path: 'desc',
        name: 'DescDemo',
        meta: {
          title: 'routes.demo.comp.desc',
        },
      },
      {
        path: 'verify',
        name: 'VerifyDemo',
        redirect: '/comp/verify/drag',
        meta: {
          title: 'routes.demo.comp.verify',
        },
        children: [
          {
            path: 'drag',
            name: 'VerifyDragDemo',
            meta: {
              title: 'routes.demo.comp.verifyDrag',
            },
          },
          {
            path: 'rotate',
            name: 'VerifyRotateDemo',
            meta: {
              title: 'routes.demo.comp.verifyRotate',
            },
          },
        ],
      },
      {
        path: 'qrcode',
        name: 'QrCodeDemo',
        meta: {
          title: 'routes.demo.comp.qrcode',
        },
      },
      {
        path: 'strength-meter',
        name: 'StrengthMeterDemo',
        meta: {
          title: 'routes.demo.comp.strength',
        },
      },
      {
        path: 'upload',
        name: 'UploadDemo',
        meta: {
          title: 'routes.demo.comp.upload',
        },
      },
      {
        path: 'loading',
        name: 'LoadingDemo',
        meta: {
          title: 'routes.demo.comp.loading',
        },
      },
      {
        path: 'cardList',
        name: 'CardListDemo',
        meta: {
          title: 'routes.demo.comp.cardList',
        },
      },
    ],
  },
  {
    path: '/permission',
    name: 'Permission',
    redirect: '/permission/menu',
    meta: {
      orderNo: 15,
      icon: 'ion:key-outline',
      title: 'routes.demo.permission.permission',
    },
    children: [
      {
        path: 'menu',
        name: 'PermissionMenu',
        meta: {
          title: 'routes.demo.permission.menu',
        },
      },
    ],
  },
  {
    path: '/about',
    name: 'About',
    redirect: '/about/index',
    meta: {
      hideChildrenInMenu: true,
      icon: 'simple-icons:about-dot-me',
      title: 'routes.dashboard.about',
      orderNo: 100000,
    },
    children: [
      {
        path: 'index',
        name: 'AboutPage',
        meta: {
          title: 'routes.dashboard.about',
          icon: 'simple-icons:about-dot-me',
          hideMenu: true,
        },
      },
    ],
  },
];
