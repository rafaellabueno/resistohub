import { Button } from "@/components/ui/button";
import DefaultLayout from "@/layout/default";
import { api } from "@/utils/api";

export default function Test() {
    const send = api.contact.sendEmail.useMutation({
        onSuccess: () => {
          console.log("success")
        },
      });
    
      const handleSave = () => {
        send.mutate({
          name: 'name',
          email: 'email',
          subject: 'subject',
          message: 'message',
        })
      }
    return (
        <>
       
        </>
    );
}

Test.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};