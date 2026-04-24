import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const Breadcrumb = ({ path, onNavigate }) => {
    const items = [
        {
            title: <HomeOutlined />,
            onClick: () => onNavigate(-1)
        },
        ...path.map((folder, index) => ({
            title: folder.name,
            onClick: () => onNavigate(index)
        }))
    ];

    return <AntBreadcrumb items={items} className="mb-4" />;
};

export default Breadcrumb;
