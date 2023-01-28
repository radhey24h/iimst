import React, { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { getStudents } from './studentSlice';

export const StudentPage = () => {

  const dispatch = useAppDispatch();
  const initApp = useCallback(async () => {
    await dispatch(getStudents());
  }, [dispatch]);

  useEffect(() => {
    initApp();
  }, [])

  const { students } = useAppSelector((state) => state.student);

  return (<>
    {students && students.map(x => {
      <div>
        {x.name}
      </div>
    })}
  </>
  )
}
