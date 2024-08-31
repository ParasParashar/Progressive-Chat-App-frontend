import { Skeleton } from "../ui/skeleton";

export function UserSkeleton() {
  return (
    <div className="flex items-center space-x-4 px-2 p-1 ">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-1 w-full">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function MessagePageSkeleton({ type }: { type?: boolean }) {
  return (
    <div className="h-full w-full flex-col flex items-center justify-between  ">
      <div className=" w-full h-full flex flex-col items-center justify-between   p-5 ">
        <div className="flex items-center w-1/2  gap-x-2 mr-auto">
          <Skeleton className=" size-10 rounded-full" />
          <Skeleton className="w-full h-10 rounded-full  " />
        </div>
        <div className="flex items-center w-full md:w-1/5 gap-x-2 ml-auto">
          <Skeleton className="w-full h-10 rounded-full  " />
          <Skeleton className=" size-10 rounded-full" />
        </div>
        <div className="flex items-center w-3/5 md:w-1/4 gap-x-2 mr-auto">
          <Skeleton className=" size-10 rounded-full" />
          <Skeleton className="w-full h-10 rounded-full  " />
        </div>
        <div className="flex items-center w-1/2 gap-x-2 ml-auto">
          <Skeleton className="w-full h-10 rounded-full  " />
          <Skeleton className=" size-10 rounded-full" />
        </div>
        <div className="flex items-center w-full md:w-1/5 gap-x-2 mr-auto">
          <Skeleton className="w-full h-10 rounded-full  " />
          <Skeleton className=" size-10 rounded-full" />
        </div>
        <div className="flex items-center  w-3/4 md:w-1/3 gap-x-2 ml-auto">
          <Skeleton className="w-full h-10 rounded-full  " />
          <Skeleton className=" size-10 rounded-full" />
        </div>
      </div>
      {type && (
        <div className="flex items-center justify-between gap-x-1 mt-4 w-full p-3 mb-2 h-10">
          <Skeleton className=" w-10 h-10 rounded-full" />
          <Skeleton className="w-full h-10  rounded-full" />
          <Skeleton className="w-10  h-10 rounded-full" />
        </div>
      )}
    </div>
  );
}
