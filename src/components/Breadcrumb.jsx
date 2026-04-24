import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const Breadcrumb = ({ path, onNavigate }) => {
    const items = [
        {
            title: (
                <span 
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => onNavigate(-1)}
                >
                    <HomeOutlined /> Home
                </span>
            )
        },
        ...path.map((folder, index) => ({
            title: (
                <span 
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => onNavigate(index)}
                >
                    {folder.name}
                </span>
            )
        }))
    ];

    return <AntBreadcrumb items={items} className="text-base" />;
};

export default Breadcrumb;
