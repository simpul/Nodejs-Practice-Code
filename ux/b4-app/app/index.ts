import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';
import { addBundleForm } from './templates';

// Page setup.
document.body.innerHTML = templates.main();
const mainElement = document.body.querySelector('.b4-main');
const alertsElement = document.body.querySelector('.b4-alerts');

/**
 * Use Window location hash to show the specified view.
 */
const showView = async () => {
    const [view, ...params] = window.location.hash.split("/");
    switch (view) {
        case "#welcome": 
            mainElement.innerHTML = templates.welcome();
            break;
        case "#list-bundles":
            const bundles = await getBundles();
            listBundles(bundles);
            break;
        default:
            // Unrecognized view.
            throw Error(`Unrecognized view: ${view}`);
    }
}
window.addEventListener('hashchange', showView);
showView().catch(err => (window.location.hash = '#welcome'));

const getBundles = async () => {
    const esRes = await fetch("/es/b4/bundle/_search?size=1000");
    const esResBody = await esRes.json();
    return esResBody.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name
    }));
};
const listBundles = bundles => {
    mainElement.innerHTML = templates.addBundleForm() + templates.listBundles({bundles});
    const form = mainElement.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = form.querySelector('input').value;
        addBundle(name);
    });
};

/**
 * Show an alert to the user.
 */
const showAlert = (message, type = 'danger') => {
    const html = templates.alert({type, message}); // 使用alert函数生成一个警告框
    alertsElement.insertAdjacentHTML('beforeend', html); // 插入到尾部
}

/**
 * Create a new bundle with the given name, then list bundles.
 */
const addBundle = async (name) => {
    /**
     * 考虑到Elasticsearch等其他数据库存在数据更改操作与结果显示的延迟问题
     * 因此先请求得到列表后再插入新增的bundle数据
     */
    try {
        // Grab the list of bundles already created.
        const bundles = await getBundles();

        // Add the new bundle.
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, {method: 'POST'});
        const resBody = await res.json();

        // Merge the new bundle into the original results and the show them.
        bundles.push({id: resBody._id, name});
        listBundles(bundles);
        
        showAlert(`Bundle "${name}" created!`, 'success');
    } catch (err) {
        showAlert(err);
    }
}