import React from 'react'
import {Cascader} from "antd";
import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";

type Props = {
    courseId: number
    onInit?: () => void
    onFinish?: () => void
}

const Copy: React.FC<Props> = ({ courseId, onInit, onFinish }) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [courses, setCourses] = React.useState<any[]>([])
    const [value, setValue] = React.useState<any>([])

    React.useEffect(() => {
        getCourses()
    }, [])

    const getCourses = async () => {
        try{
            const response = (await Request(user.jwt.access_token)
                .get(`admin/courses?&with_count=modules&exclude=${courseId}`)).data;
            setCourses(
                response.data
                    .filter((c: any) => c.modules_count > 0)
                    .map((c: any) => ({
                        value: c.id,
                        label: c.name,
                        isLeaf: false,
                    }))
            );
        }catch (err){}
    }

    const loadModulesFromCourse = async (selectedOptions?: any[]): Promise<void> => {
        if(!selectedOptions) return

        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        try{
            const modules = (await Request(user.jwt.access_token)
                .get(`admin/modules?course_id=${targetOption.value}`)).data
            targetOption.children = modules.data.map((m: any) => ({
                value: m.id,
                label: m.title
            }))
            targetOption.loading = false;
            setCourses([...courses])
        }catch (err){}
    };

    const cloneModule = async (values: any[]) => {

        setValue(values)

        if( values.length < 2 ) return;

        const course = courses.find(c => c.value === values[0])

        const keep = confirm(`Têm certeza que deseja importar o módulo do curso "${course.label}"?`)

        if(!keep) return;

        onInit && onInit()
        try{
            (await Request(user.jwt.access_token)
                .post('admin/module-copy', {
                    course_id: courseId,
                    module_id: values[1],
                })).data
        }catch (err){}
        onFinish && onFinish()
    }

    return(
        <Cascader
            value={value}
            placeholder="Clonar módulo"
            options={courses}
            loadData={loadModulesFromCourse}
            onChange={cloneModule}
            changeOnSelect />
    )
}

export default Copy
